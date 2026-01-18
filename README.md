# Kaszinó (demo)

## Áttekintés

Ez a repó egy egyszerű, böngészőből futtatható kaszinó demo több mini-játékkal. A belépés/regisztráció PHP session alapú, a felhasználói egyenleg pedig JSON fájlokban tárolódik. A főoldal a bejelentkezett felhasználóknak listázza a játékokat, és megjeleníti az aktuális coin egyenleget. 【F:index.html†L1-L97】【F:auth/login.php†L1-L20】【F:auth/register.php†L1-L29】【F:api/get_balance.php†L1-L7】

## Fő funkciók

- **Bejelentkezés/regisztráció:** egyszerű formok és PHP végpontok session alapon. 【F:login.html†L1-L29】【F:register.html†L1-L29】【F:auth/login.php†L1-L20】【F:auth/register.php†L1-L29】
- **Egyenleg kezelés:** lekérdezés és frissítés PHP API-n keresztül. 【F:api/get_balance.php†L1-L7】【F:api/update_balance.php†L1-L12】
- **Játékok:**
  - Blackjack (`blackjack/blackjack.html`).
  - 5x5 slot (`felkaru_rablo/rablo.html`).
  - Rulett (`rulett/rulett.html`, `rulett/style.css`, `rulett/rulett_script.js`).
  - Texas Hold’em poker (`poker/poker.html`).
  - Crash/piac játék (`crash/crash.html`) valós idejű charttal. 【F:index.html†L44-L48】【F:crash/crash.html†L1-L188】
- **Chart API:** Flask alapú, folyamatosan generált piaci adatokkal. 【F:api/chart.py†L1-L140】

## Könyvtárstruktúra

- `index.html` – főoldal, belépés után játéklista és egyenleg. 【F:index.html†L1-L97】
- `login.html`, `register.html` – belépés/regisztráció felületek. 【F:login.html†L1-L29】【F:register.html†L1-L29】
- `auth/` – PHP beléptető végpontok (`login.php`, `logout.php`, `register.php`). 【F:auth/login.php†L1-L20】【F:auth/logout.php†L1-L5】【F:auth/register.php†L1-L29】
- `api/` – egyenleg API és chart generátor (`get_balance.php`, `update_balance.php`, `chart.py`). 【F:api/get_balance.php†L1-L7】【F:api/update_balance.php†L1-L12】【F:api/chart.py†L1-L140】
- `users/` – felhasználói JSON fájlok (regisztrációkor jönnek létre, alap egyenleg: 500). 【F:auth/register.php†L12-L26】
- `blackjack/`, `felkaru_rablo/`, `rulett/`, `poker/`, `crash/` – játékoldalak és assetek. 【F:index.html†L44-L48】

## Futtatás lokálisan

### 1) PHP szerver (statikus oldalak + PHP API)

A `crash` játék abszolút `/casino/...` útvonalakat hív, ezért érdemes a repó gyökere fölötti mappát docrootnak használni.

```bash
php -S 0.0.0.0:8000 -t /workspace
```

Ezután a főoldal elérhető például itt:

```
http://localhost:8000/casino/index.html
```

A bejelentkezés után az egyenleg lekérése és frissítése a PHP végpontokon történik. 【F:index.html†L49-L93】【F:api/get_balance.php†L1-L7】【F:api/update_balance.php†L1-L12】

### 2) Chart API (Crash játék)

A crash chart a Flask API-ból kapja az adatokat.

```bash
cd /workspace/casino/api
python3 chart.py
```

Ez a szerver a `http://localhost:5001` címen szolgálja ki a chart adatokat. 【F:api/chart.py†L1-L140】

## Megjegyzések

- A felhasználói adatok a `users/` könyvtárban JSON fájlokként tárolódnak, a jelszavak hashelt formában. 【F:auth/register.php†L12-L26】
- A crash játék a `/casino/api` és `/casino/chart-api` végpontokat hívja, ezért a PHP szerver docrootja legyen a `casino` mappa fölött. 【F:crash/crash.html†L24-L188】
