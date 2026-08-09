from pathlib import Path
from datetime import datetime
import pandas as pd
import json

BASE_DIR = Path(__file__).resolve().parent

YOUTUBE_FILE = BASE_DIR.parent / "YouTubeDashboard" / "data" / "data.xlsx"
TVER_FILE = BASE_DIR.parent / "TVerDashboard" / "data" / "data.xlsx"
LOCIPO_FILE = BASE_DIR.parent / "LocipoDashboard" / "data" / "data.xlsx"

OUTPUT_DIR = BASE_DIR / "data"

def is_blank(value):
    if value is None:
        return True

    if pd.isna(value):
        return True

    if str(value).strip() == "":
        return True

    if str(value).strip().lower() == "nan":
        return True

    return False

BASE_DIR = Path(__file__).resolve().parent

def export_youtube():

    cards = pd.read_excel(
        YOUTUBE_FILE,
        sheet_name="Cards"
    )

    print(cards.columns)
    print(cards.head())

    carddata = pd.read_excel(
        YOUTUBE_FILE,
        sheet_name="CardData",
        header=None
    )

    records = []

    # Cardsを1件ずつ処理
    for _, card in cards.iterrows():

        no = str(card["No"]).strip()

        views = None
        views_history = []

        # CardDataの1行目から、該当するNoの列を探す
        for col in range(1, carddata.shape[1]):

            if str(carddata.iloc[0, col]).strip() == no:

                # Day1～最新までの再生回数を取得
                values = carddata.iloc[1:, col].dropna()

                for value in values:

                    # 数値以外は除外
                    if not isinstance(value, (int, float)):
                        continue

                    if isinstance(value, float) and value.is_integer():
                        value = int(value)

                    views_history.append(value)

                # 最新の再生回数
                if len(views_history) > 0:
                    views = views_history[-1]

                break

        # 日付
        date = pd.to_datetime(
            card["公開日"]
        ).strftime("%Y-%m-%d")

        records.append({
            "id": int(card["ID"]),
            "week": no,
            "title": str(card["動画タイトル"]),
            "date": date,
            "views": views,
            "views_history": views_history,
            "members": str(card["出演者"]),
            "url": str(card["URL"])
        })

    with open(
        OUTPUT_DIR / "youtube.json",
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            records,
            f,
            ensure_ascii=False,
            indent=4
        )

    # 未入力チェック
    for record in records:

        if is_blank(record["title"]):
            print(
                f'⚠ YouTube {record["week"]} の動画タイトルが未入力です'
            )

        if is_blank(record["members"]):
            print(
                f'⚠ YouTube {record["week"]} の出演者が未入力です'
            )

        if is_blank(record["date"]):
            print(
                f'⚠ YouTube {record["week"]} の公開日が未入力です'
            )

        if is_blank(record["url"]):
            print(
                f'⚠ YouTube {record["week"]} のURLが未入力です'
            )

        if record["views"] is None:
            print(
                f'⚠ YouTube {record["week"]} の再生回数が未入力です'
            )

    print("youtube.json を更新しました")

def export_itadakishasu():

    cards = pd.read_excel(
        TVER_FILE,
        sheet_name="Cards"
    )

    carddata = pd.read_excel(
        TVER_FILE,
        sheet_name="CardData",
        header=None
    )

    records = []

    # Cardsを1件ずつ処理
    for _, card in cards.iterrows():

        no = str(card["No"]).strip()

        # #1 → 1
        id_number = int(no.replace("#", ""))

        # CardDataから該当する列を探す
        ranking_col = None
        likes_col = None

        for col in range(1, carddata.shape[1]):

            if str(carddata.iloc[0, col]).strip() == no:

                if str(carddata.iloc[1, col]).strip() == "順位":
                    ranking_col = col

                elif str(carddata.iloc[1, col]).strip() == "高評価":
                    likes_col = col

        # 最新の高評価を取得
        likes = None

        if likes_col is not None:

            values = carddata.iloc[2:, likes_col].dropna()

            if len(values) > 0:
                likes = int(values.iloc[-1])

        # 最高順位を取得
        best_ranking = ""

        if ranking_col is not None:

            values = carddata.iloc[2:, ranking_col].dropna()

            # 数字の順位だけ取り出す
            numeric_values = []

            for value in values:

                if isinstance(value, (int, float)):

                    if not pd.isna(value):
                        numeric_values.append(int(value))

                elif str(value).isdigit():

                    numeric_values.append(int(value))

            # 一番小さい数字＝最高順位
            if len(numeric_values) > 0:
                best_ranking = min(numeric_values)

        # 日付
        date = pd.to_datetime(
            card["配信開始日"]
        ).strftime("%Y-%m-%d")

        records.append({
            "id": id_number,
            "week": no,
            "title": f"絶品いただきシャス！ {no}",
            "date": date,
            "likes": likes,
            "best_ranking": best_ranking,
            "members": card["メンバー"],
            "url": str(card["URL"]) if pd.notna(card["URL"]) else "",
            "available": bool(card["配信中"]) if pd.notna(card["配信中"]) else False
        })

    with open(
        OUTPUT_DIR / "itadakishasu.json",
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            records,
            f,
            ensure_ascii=False,
            indent=4
        )

    # 未入力チェック
    for record in records:

        if is_blank(record["date"]):
            print(
                f'⚠ TVer {record["week"]} の配信開始日が未入力です'
            )

        if is_blank(record["members"]):
            print(
                f'⚠ TVer {record["week"]} の出演者が未入力です'
            )

        if record["likes"] is None:
            print(
                f'⚠ TVer {record["week"]} の高評価が未入力です'
            )

        if record["available"] and is_blank(record["url"]):
            print(
                f'⚠ TVer {record["week"]} は配信中ですがURLが未入力です'
            )

    print("itadakishasu.json を更新しました")

def export_locipo():

    cards = pd.read_excel(
        LOCIPO_FILE,
        sheet_name="Cards"
    )

    carddata = pd.read_excel(
        LOCIPO_FILE,
        sheet_name="CardData",
        header=None
    )

    ranking_map = {}
    comments_map = {}

    current_date = None

    # -------------------------
    # CardDataを読み込む
    # -------------------------

    for column in range(1, carddata.shape[1]):

        date_value = carddata.iloc[0, column]

        # 日付が入っている列なら更新
        if not pd.isna(date_value):

            try:
                current_date = pd.to_datetime(
                    date_value
                ).strftime("%Y-%m-%d")

            except:
                current_date = None

        if current_date is None:
            continue

        metric = str(
            carddata.iloc[1, column]
        ).strip()

        if metric not in [
            "ランキング",
            "コメント数"
        ]:
            continue

        values = carddata.iloc[
            2:,
            column
        ]

        # -------------------------
        # ランキング
        # -------------------------

        if metric == "ランキング":

            ranking_history = []

            for value in values:

                if pd.isna(value):
                    continue

                if isinstance(value, float) and value.is_integer():
                    value = int(value)

                ranking_history.append(
                    f"{value}位"
                )

            ranking_map[current_date] = ranking_history

        # -------------------------
        # コメント数
        # -------------------------

        elif metric == "コメント数":

            values = values.dropna()

            if len(values) == 0:
                continue

            # 最新のコメント数だけ保存
            value = values.iloc[-1]

            if isinstance(value, float) and value.is_integer():
                value = int(value)

            comments_map[current_date] = value

    # -------------------------
    # Cards → JSON
    # -------------------------

    records = []

    for index, card in cards.iterrows():

        no_date = pd.to_datetime(
            card["No"]
        ).strftime("%Y-%m-%d")

        distribution_date = pd.to_datetime(
            card["配信開始日"]
        ).strftime("%Y-%m-%d")

        record = {
            "id": index + 1,
            "week": no_date,
            "title": str(card["動画タイトル"]),
            "date": distribution_date,

            # 出演者
            "members": str(card["動画タイトル"]),

            # 順位はDay1～最新まで全部保存
            "ranking_history": ranking_map.get(
                no_date,
                []
            ),

            # コメントは最新値だけ
            "comments": comments_map.get(
                no_date,
                ""
            ),

            "school": str(card["学校"]),
            "url": str(card["URL"]) if pd.notna(card["URL"]) else "",
            "available": bool(card["配信中"]) if pd.notna(card["配信中"]) else False
        }

        records.append(record)

    # -------------------------
    # JSON出力
    # -------------------------

    with open(
        OUTPUT_DIR / "locipo.json",
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            records,
            f,
            ensure_ascii=False,
            indent=4
        )

    # 未入力チェック
    for record in records:

        if is_blank(record["date"]):
            print(
                f'⚠ Locipo {record["week"]} の配信開始日が未入力です'
            )

        if is_blank(record["members"]):
            print(
                f'⚠ Locipo {record["week"]} の出演者が未入力です'
            )

        if is_blank(record["school"]):
            print(
                f'⚠ Locipo {record["week"]} の学校名が未入力です'
            )

        if record["available"] and is_blank(record["url"]):
            print(
                f'⚠ Locipo {record["week"]} は配信中ですがURLが未入力です'
            )

        if not record["ranking_history"]:
            print(
                f'⚠ Locipo {record["week"]} の順位データがありません'
            )

        if is_blank(record["comments"]):
            print(
                f'⚠ Locipo {record["week"]} のコメント数が未入力です'
            )

    print("locipo.json を更新しました")

def export_update():

    update = {
        "last_update": datetime.now().strftime("%Y/%m/%d %H:00")
    }

    with open(
        OUTPUT_DIR / "update.json",
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            update,
            f,
            ensure_ascii=False,
            indent=4
        )

    print("update.json を更新しました")

export_youtube()
export_itadakishasu()
export_locipo()
export_update()