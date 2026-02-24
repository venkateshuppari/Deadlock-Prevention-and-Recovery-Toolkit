# 🛠 Deadlock Prevention & Recovery Toolkit

A simulation-based toolkit that demonstrates Deadlock Prevention, Detection, and Recovery techniques used in Operating Systems.

---

## 🚀 Features

- Banker's Algorithm (Safe State Detection)
- Resource Allocation Graph (Cycle Detection)
- Wait-For Graph
- Circular Wait Prevention
- Process Termination Strategy
- Resource Preemption Strategy
- Logging & Reporting

---

## 📊 Workflow

1. Initialize system resources and processes.
2. Accept resource requests from processes.
3. Apply prevention strategies.
4. Run detection algorithms periodically.
5. Trigger recovery mechanism if deadlock detected.
6. Resume system in safe state.

---

## 🏗 Architecture

Prevention → Detection → Recovery → Resume

---

## ▶️ How to Run

```bash
pip install -r requirements.txt
python main.py
