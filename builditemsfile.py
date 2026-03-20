import os
import json


def extract_png_filenames_to_jsonl(items_directory='public/items', output_file='items.txt'):
    # 确保目录存在
    if not os.path.exists(items_directory):
        print(f"Directory {items_directory} does not exist.")
        return

    # 获取所有PNG文件
    png_files = [f for f in os.listdir(items_directory) if f.lower().endswith('.png')]

    # 将文件名写入JSONL文件
    with open(output_file, 'w', encoding='utf-8') as f:
        for idx, filename in enumerate(png_files):
            filename = filename[5:-4]
            json_obj = "static constexpr Item " + str(filename) + " = {" + str(idx+1) + "," + ('ItemType::Liquid' if 'liquid' in filename.lower() else 'ItemType::Solid') + "};"
            f.write(json_obj + '\n')

    print(f"Found {len(png_files)} PNG files. Output written to {output_file}")


if __name__ == "__main__":
    extract_png_filenames_to_jsonl()
