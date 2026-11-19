"""Train the project's OralCancerCNN on labeled oral-cavity photographs.

Expected inputs are the extracted archives under training_data/. The supplied
data is binary, so labels are benign/non-cancer and malignant/cancer.
"""

from __future__ import annotations

import argparse
import json
import random
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageEnhance, ImageOps
from torch import nn
from torch.utils.data import DataLoader, Dataset

import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "server"))
from ml_pipeline import OralCancerCNN  # noqa: E402


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def collect_images(root: Path, include_augmented: bool) -> list[tuple[Path, int]]:
    items: list[tuple[Path, int]] = []
    for folder_name, label in (("benign_lesions", 0), ("malignant_lesions", 1)):
        folder = root / "Oral Images Dataset" / "original_data" / folder_name
        items.extend((path, label) for path in folder.rglob("*") if path.suffix.lower() in IMAGE_EXTENSIONS)
    if include_augmented:
        for folder_name, label in (("augmented_benign", 0), ("augmented_malignant", 1)):
            folder = root / "Oral Images Dataset" / "augmented_data" / folder_name
            items.extend((path, label) for path in folder.rglob("*") if path.suffix.lower() in IMAGE_EXTENSIONS)
    return items


def collect_secondary(root: Path) -> list[tuple[Path, int]]:
    items: list[tuple[Path, int]] = []
    for folder_name, label in (("non-cancer", 0), ("cancer", 1)):
        folder = root / "OralCancer" / folder_name
        items.extend((path, label) for path in folder.rglob("*") if path.suffix.lower() in IMAGE_EXTENSIONS)
    return items


class OralImageDataset(Dataset):
    def __init__(self, items: list[tuple[Path, int]], training: bool, image_size: int = 160):
        self.items = items
        self.training = training
        self.image_size = image_size

    def __len__(self) -> int:
        return len(self.items)

    def __getitem__(self, index: int):
        path, label = self.items[index]
        image = Image.open(path).convert("RGB")
        image = ImageOps.fit(image, (self.image_size, self.image_size), method=Image.Resampling.BILINEAR)
        if self.training:
            if random.random() < 0.5:
                image = ImageOps.mirror(image)
            if random.random() < 0.35:
                image = ImageEnhance.Brightness(image).enhance(random.uniform(0.85, 1.15))
            if random.random() < 0.35:
                image = ImageEnhance.Contrast(image).enhance(random.uniform(0.85, 1.15))
        array = np.asarray(image, dtype=np.float32) / 255.0
        array = (array - np.array([0.485, 0.456, 0.406])) / np.array([0.229, 0.224, 0.225])
        tensor = torch.from_numpy(array.transpose(2, 0, 1)).float()
        return tensor, torch.tensor(label, dtype=torch.long)


def evaluate(model, loader, device):
    model.eval()
    correct = total = 0
    tp = tn = fp = fn = 0
    with torch.no_grad():
        for images, labels in loader:
            outputs = model(images.to(device))
            predictions = outputs.argmax(dim=1).cpu()
            correct += int((predictions == labels).sum())
            total += len(labels)
            tp += int(((predictions == 1) & (labels == 1)).sum())
            tn += int(((predictions == 0) & (labels == 0)).sum())
            fp += int(((predictions == 1) & (labels == 0)).sum())
            fn += int(((predictions == 0) & (labels == 1)).sum())
    return {
        "accuracy": correct / max(total, 1),
        "sensitivity": tp / max(tp + fn, 1),
        "specificity": tn / max(tn + fp, 1),
        "samples": total,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-root", default=str(ROOT / "training_data"))
    parser.add_argument("--output", default=str(ROOT / "models" / "oral_cancer_cnn.pth"))
    parser.add_argument("--epochs", type=int, default=12)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--image-size", type=int, default=160)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    torch.set_num_threads(min(8, torch.get_num_threads()))

    random.seed(args.seed)
    np.random.seed(args.seed)
    torch.manual_seed(args.seed)
    data_root = Path(args.data_root)
    primary = collect_images(data_root / "dataset_primary", include_augmented=True)
    secondary = collect_secondary(data_root / "dataset_secondary")
    if not primary or not secondary:
        raise RuntimeError("Both extracted datasets are required before training.")

    random.shuffle(primary)
    split = int(len(primary) * 0.85)
    train_items, validation_items = primary[:split], primary[split:]
    train_loader = DataLoader(OralImageDataset(train_items, True, args.image_size), batch_size=args.batch_size, shuffle=True, num_workers=0)
    validation_loader = DataLoader(OralImageDataset(validation_items, False, args.image_size), batch_size=args.batch_size, num_workers=0)
    external_loader = DataLoader(OralImageDataset(secondary, False, args.image_size), batch_size=args.batch_size, num_workers=0)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = OralCancerCNN(num_classes=2).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4, weight_decay=1e-4)
    loss_fn = nn.CrossEntropyLoss()
    best_external = -1.0
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    for epoch in range(1, args.epochs + 1):
        model.train()
        running_loss = 0.0
        for images, labels in train_loader:
            optimizer.zero_grad()
            logits = model(images.to(device))
            loss = loss_fn(logits, labels.to(device))
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * len(labels)
        validation_metrics = evaluate(model, validation_loader, device)
        external_metrics = evaluate(model, external_loader, device)
        print(json.dumps({"epoch": epoch, "loss": running_loss / len(train_items), "validation": validation_metrics, "external": external_metrics}))
        if external_metrics["accuracy"] > best_external:
            best_external = external_metrics["accuracy"]
            torch.save({
                "state_dict": model.state_dict(),
                "classes": ["benign_or_non_cancer", "malignant_or_cancer"],
                "architecture": "OncoLink OralCancerCNN",
                "metrics": {"validation": validation_metrics, "external": external_metrics},
            }, output_path)

    print(json.dumps({"saved_checkpoint": str(output_path), "device": str(device), "best_external_accuracy": best_external}))


if __name__ == "__main__":
    main()
