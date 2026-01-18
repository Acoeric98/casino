from flask import Flask, jsonify
import random
import json
import os
from datetime import datetime

app = Flask(__name__)

# Állapot minden charthoz
charts = {
    i: [1.0 for _ in range(100)] for i in range(1, 7)
}

# Beszakadás / kitörés hullámok kezelése
waves = {
    i: {
        "active": False,
        "direction": None,
        "duration": 0
    } for i in range(1, 7)
}

HISTORY_DIR = "history"
os.makedirs(HISTORY_DIR, exist_ok=True)

# Mentés funkció
def save_history(chart_id, data):
    now = datetime.utcnow().strftime("%Y-%m-%d_%H")
    path = os.path.join(HISTORY_DIR, f"chart{chart_id}_{now}.json")

    if os.path.exists(path):
        with open(path, "r") as f:
            history = json.load(f)
    else:
        history = []

    history.append(data[-1])

    if len(history) > 3600:  # 2 óra * 60 perc * 60 / 2 sec
        history = history[-3600:]

    with open(path, "w") as f:
        json.dump(history, f)

def update_chart(data, wave):
    last = data[-1]

    # Elindítunk néha egy hullámot vagy alakzatot
    if not wave["active"]:
        rand = random.random()
        if rand < 0.03:
            wave["active"] = True
            wave["direction"] = "hammer"
            wave["duration"] = 5
        elif rand < 0.06:
            wave["active"] = True
            wave["direction"] = "shooting_star"
            wave["duration"] = 5
        elif rand < 0.09:
            wave["active"] = True
            wave["direction"] = "cup_and_handle"
            wave["duration"] = 8
        elif rand < 0.12:
            wave["active"] = True
            wave["direction"] = "head_and_shoulders"
            wave["duration"] = 10
        elif rand < 0.20:
            wave["active"] = True
            wave["direction"] = "up" if random.random() < 0.5 else "down"
            wave["duration"] = random.randint(5, 10)

    # Alakzat aktív → meghatározzuk a mozgást
    if wave["active"]:
        direction = wave["direction"]
        dur = wave["duration"]

        if direction == "up":
            multiplier = random.uniform(1.01, 1.05)
        elif direction == "down":
            multiplier = random.uniform(0.95, 0.99)

        elif direction == "hammer":
            if dur > 3:
                multiplier = random.uniform(0.96, 0.98)  # esés
            else:
                multiplier = random.uniform(1.07, 1.12)  # visszapattanás

        elif direction == "shooting_star":
            if dur > 3:
                multiplier = random.uniform(1.05, 1.1)   # felugrás
            else:
                multiplier = random.uniform(0.88, 0.94)  # beesés

        elif direction == "cup_and_handle":
            if dur > 6:
                multiplier = random.uniform(0.98, 0.995)  # ereszkedés (csésze íve)
            elif dur > 3:
                multiplier = random.uniform(0.998, 1.002)  # alj (lapos)
            else:
                multiplier = random.uniform(1.03, 1.06)    # fül (emelkedés)

        elif direction == "head_and_shoulders":
            if dur > 7:
                multiplier = random.uniform(1.01, 1.03)   # bal váll
            elif dur > 4:
                multiplier = random.uniform(1.06, 1.1)    # fej
            elif dur > 2:
                multiplier = random.uniform(1.01, 1.03)   # jobb váll
            else:
                multiplier = random.uniform(0.85, 0.93)   # zuhanás

        else:
            multiplier = 1.0  # biztonsági fallback

        wave["duration"] -= 1
        if wave["duration"] <= 0:
            wave["active"] = False

    else:
        # Normál piaci mozgás
        change = random.uniform(-0.005, 0.005)
        multiplier = 1.0 + change

    new_value = max(0.01, round(last * multiplier, 2))
    data.append(new_value)
    return data[-100:]

@app.route("/chart-api/chart<int:chart_id>")
def get_chart(chart_id):
    if chart_id in charts:
        charts[chart_id] = update_chart(charts[chart_id], waves[chart_id])
        save_history(chart_id, charts[chart_id])
        return jsonify(charts[chart_id])
    return jsonify({"error": "Chart not found"}), 404

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)
