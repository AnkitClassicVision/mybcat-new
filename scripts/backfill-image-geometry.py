#!/usr/bin/env python3
"""Backfill canonical blog WebPs to the 1200x630, under-200KB contract.

Canonical images are top-level ``public/images/blog/*.webp`` files excluding
the responsive ``-400[w]``, ``-800[w]``, and ``-1200[w]`` variants. Existing
compliant images and all non-WebP sources are left untouched.
"""

import argparse
import io
import os
import re
import sys
from pathlib import Path

from PIL import Image


REPO_ROOT = Path(__file__).resolve().parent.parent
BLOG_IMAGE_DIR = REPO_ROOT / "public" / "images" / "blog"

TARGET_W, TARGET_H = 1200, 630
MAX_BYTES = 200 * 1024
QUALITY_START = 90
QUALITY_FLOOR = 5
QUALITY_STEP = 5

VARIANT_SUFFIX_RE = re.compile(r"-(?:400|800|1200)w?\.webp$")


def canonical_webps(directory: Path):
    """Return canonical WebPs in stable filename order."""
    return sorted(
        path
        for path in directory.iterdir()
        if path.is_file()
        and path.suffix == ".webp"
        and not VARIANT_SUFFIX_RE.search(path.name)
    )


def cover_crop(image: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """Resize to cover, then center-crop without stretching or padding."""
    width, height = image.size
    scale = max(target_w / width, target_h / height)
    resized_w = max(target_w, round(width * scale))
    resized_h = max(target_h, round(height * scale))
    if (resized_w, resized_h) != (width, height):
        image = image.resize((resized_w, resized_h), Image.Resampling.LANCZOS)
    left = (resized_w - target_w) // 2
    top = (resized_h - target_h) // 2
    return image.crop((left, top, left + target_w, top + target_h))


def normalize_mode(image: Image.Image) -> Image.Image:
    """Convert uncommon modes while preserving an alpha channel when present."""
    if image.mode in ("RGB", "RGBA"):
        return image
    if "A" in image.mode or "transparency" in image.info:
        return image.convert("RGBA")
    return image.convert("RGB")


def encode_webp_under_budget(image: Image.Image):
    """Encode near q90, reducing quality only until the byte cap is met."""
    for quality in range(QUALITY_START, QUALITY_FLOOR - 1, -QUALITY_STEP):
        buffer = io.BytesIO()
        image.save(buffer, "WEBP", quality=quality, method=6)
        data = buffer.getvalue()
        if len(data) < MAX_BYTES:
            return data, quality
    raise ValueError(f"cannot encode below {MAX_BYTES} bytes at q{QUALITY_FLOOR}")


def pick_source(webp_path: Path, webp_size):
    """Prefer a same-stem PNG when it has at least as many source pixels."""
    png_path = webp_path.with_suffix(".png")
    if png_path.is_file():
        try:
            with Image.open(png_path) as probe:
                png_size = probe.size
            if png_size[0] * png_size[1] >= webp_size[0] * webp_size[1]:
                return png_path
        except Exception:
            pass
    return webp_path


def atomic_write(path: Path, data: bytes):
    """Durably replace one image without exposing a partially written file."""
    temporary_path = path.with_name(f".{path.name}.tmp")
    try:
        with temporary_path.open("wb") as output:
            output.write(data)
            output.flush()
            os.fsync(output.fileno())
        os.replace(temporary_path, path)
    finally:
        temporary_path.unlink(missing_ok=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="report off-contract files without writing",
    )
    args = parser.parse_args()

    if not BLOG_IMAGE_DIR.is_dir():
        print(f"error: image directory not found: {BLOG_IMAGE_DIR}", file=sys.stderr)
        return 1

    scanned = compliant = modified = failures = 0

    for path in canonical_webps(BLOG_IMAGE_DIR):
        scanned += 1
        try:
            old_bytes = path.stat().st_size
            with Image.open(path) as image:
                old_size = image.size
        except Exception as error:
            failures += 1
            print(f"FAIL  {path.name}: unreadable ({error})")
            continue

        if old_size == (TARGET_W, TARGET_H) and old_bytes < MAX_BYTES:
            compliant += 1
            continue

        source = pick_source(path, old_size)
        source_note = "png" if source != path else "webp"
        dimensions = f"{old_size[0]}x{old_size[1]} -> {TARGET_W}x{TARGET_H}"

        if args.dry_run:
            modified += 1
            print(
                f"WOULD {path.name}: {dimensions}, {old_bytes} bytes "
                f"(source={source_note})"
            )
            continue

        try:
            with Image.open(source) as image:
                image.load()
                cropped = cover_crop(
                    normalize_mode(image), TARGET_W, TARGET_H
                )
            data, quality = encode_webp_under_budget(cropped)
            atomic_write(path, data)
            modified += 1
            print(
                f"OK    {path.name}: {dimensions}, "
                f"{old_bytes} -> {len(data)} bytes "
                f"(q={quality}, source={source_note})"
            )
        except Exception as error:
            failures += 1
            print(f"FAIL  {path.name}: {error}")

    verb = "would modify" if args.dry_run else "modified"
    print(
        f"\nSummary: {scanned} canonical scanned, "
        f"{compliant} compliant (skipped), {verb} {modified}, "
        f"{failures} failures"
    )
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
