FROM python:3.12-slim

WORKDIR /app

# System deps: LibreOffice (for word-to-pdf), Ghostscript (for PDF compression) + fonts
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libreoffice-writer \
       ghostscript \
       fonts-dejavu \
       fonts-noto \
       fontconfig \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 3001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3001"]
