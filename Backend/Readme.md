# Setup Instructions

## **1. Install dependencies from `requirements.txt`**
Run the following command:
```sh
pip install -r requirements.txt
```

---

## **2. Run the application**
Start the application using Uvicorn:
```sh
uvicorn main:app --reload
```

---

## **Notes**
- The application will be hosted at: `http://127.0.0.1:8000/`
- To test the backend, open your browser and visit:
  ```sh
  http://127.0.0.1:8000/docs
  ```
  This will open the interactive Swagger UI for API testing.