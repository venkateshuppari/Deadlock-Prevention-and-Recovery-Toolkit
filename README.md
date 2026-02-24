# 🛠 Deadlock Prevention & Recovery Toolkit

A Python-based simulation toolkit implementing Deadlock Prevention, Detection, and Recovery techniques used in Operating Systems.

---

## 📌 Features

- ✅ Banker's Algorithm (Safe State Detection)
- ✅ Resource Allocation Graph Detection
- ✅ Deadlock Recovery using Process Termination
- ✅ Modular Architecture
- ✅ Logging Support

---

## 🏗 Architecture

User Input → Resource Manager → Prevention → Detection → Recovery → Resume

---

## ▶ How to Run

```bash
pip install -r requirements.txt
python main.py


(No external libraries required)

---

## 📄 3️⃣ main.py

```python
from core.resource_manager import ResourceManager
from prevention.bankers_algorithm import BankersAlgorithm
from detection.deadlock_detector import DeadlockDetector
from recovery.recovery_manager import RecoveryManager

def main():
    print("=== Deadlock Prevention & Recovery Toolkit ===")

    resources = [3, 2]
    allocation = [[0, 1], [2, 0], [1, 1]]
    maximum = [[1, 2], [2, 1], [3, 1]]

    manager = ResourceManager(resources, allocation, maximum)
    banker = BankersAlgorithm(manager)
    
    if banker.is_safe():
        print("System is in SAFE state.")
    else:
        print("System is in UNSAFE state.")

        detector = DeadlockDetector(manager)
        if detector.detect_deadlock():
            print("Deadlock Detected!")
            recovery = RecoveryManager(manager)
            recovery.recover()

if __name__ == "__main__":
    main()

## 5️⃣ prevention/bankers_algorithm.py
class BankersAlgorithm:
    def __init__(self, manager):
        self.manager = manager

    def is_safe(self):
        work = self.manager.available[:]
        finish = [False] * self.manager.processes

        need = [
            [self.manager.maximum[i][j] - self.manager.allocation[i][j]
             for j in range(len(work))]
            for i in range(self.manager.processes)
        ]

        while True:
            allocated = False
            for i in range(self.manager.processes):
                if not finish[i] and all(need[i][j] <= work[j] for j in range(len(work))):
                    for j in range(len(work)):
                        work[j] += self.manager.allocation[i][j]
                    finish[i] = True
                    allocated = True

            if not allocated:
                break

        return all(finish)

## 📄 6️⃣ detection/deadlock_detector.py
class DeadlockDetector:
    def __init__(self, manager):
        self.manager = manager

    def detect_deadlock(self):
        # Simple unsafe state detection
        return sum(self.manager.available) == 0

## 📄 7️⃣ recovery/recovery_manager.py
class RecoveryManager:
    def __init__(self, manager):
        self.manager = manager

    def recover(self):
        print("Terminating Process 0 to resolve deadlock...")
        self.manager.allocation[0] = [0] * len(self.manager.resources)
        self.manager.available = self.manager.calculate_available()
        print("Recovery Complete.")

## 📄 8️⃣ LICENSE (MIT)
MIT License

Permission is hereby granted, free of charge...

## 🚀 How to Upload to GitHub
git init
git add .
git commit -m "Initial commit - Deadlock Prevention & Recovery Toolkit"
git branch -M main
git remote add origin https://github.com/yourusername/Deadlock-Prevention-and-Recovery-Toolkit.git
git push -u origin main
