import subprocess

print("========== Dashboard Update ==========\n")

print("① YouTube 更新中...")
subprocess.run(
    ["py", "update.py"],
    cwd="../YouTubeDashboard",
    check=True,
)

print("\n② TVer 更新中...")
subprocess.run(
    ["py", "update.py"],
    cwd="../TVerDashboard",
    check=True,
)

print("\n③ Locipo 更新中...")
subprocess.run(
    ["py", "update.py"],
    cwd="../LocipoDashboard",
    check=True,
)

from datetime import datetime
import json

now = datetime.now()

update_time = now.replace(
    minute=0,
    second=0,
    microsecond=0,
)

data = {
    "last_update": update_time.strftime("%Y/%m/%d %H:%M")
}

with open(
    "data/update.json",
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        data,
        f,
        ensure_ascii=False,
        indent=4
    )

print("更新日時を更新しました！")

print("\n===================================")
print("🎉 すべて更新しました！")
print("===================================")