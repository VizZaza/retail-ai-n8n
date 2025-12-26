# Retail AI + n8n (Self-hosted on VPS)

Mục tiêu: hệ thống quản lý doanh thu + hàng tồn kho, có AI gợi ý nhập hàng, có backend + frontend, dữ liệu lưu PostgreSQL (không dùng Excel), và n8n self-host để chạy các luồng tự động & gửi báo cáo email.

## Kiến trúc

- **PostgreSQL**: lưu dữ liệu app + DB cho n8n
- **Backend (Node/Express + Prisma)**: API CRUD + báo cáo + xuất PDF
- **Frontend (Next.js)**: dashboard/biểu đồ + quản trị (thêm/sửa/xóa)
- **n8n**: 4 workflow (webhook + cron + email + AI)
- **Caddy**: reverse proxy + HTTPS tự động (Let's Encrypt)

Subdomain theo DNS:
- n8n: `https://n8n.${BASE_DOMAIN}`
- api: `https://api.${BASE_DOMAIN}`
- app: `https://app.${BASE_DOMAIN}`

## Chạy trên VPS (tóm tắt)

```bash
git clone https://github.com/VizZaza/retail-ai-n8n.git
cd retail-ai-n8n
cp .env.example .env
# sửa BASE_DOMAIN, EMAIL_TO, SMTP_* , ADMIN_* ... trong .env
bash scripts/server-setup-ubuntu.sh
bash scripts/deploy.sh
bash scripts/import-workflows.sh
```

## Tài khoản admin (seed tự động)

- Email: `ADMIN_EMAIL` (trong `.env`)
- Password: `ADMIN_PASSWORD` (trong `.env`)

## Endpoint chính

- `POST /auth/login`
- `GET/POST/PUT/DELETE /products`
- `POST /inventory/adjust`
- `POST /sales/orders`
- `GET /reports/revenue`
- `GET /reports/revenue.pdf`
- `GET /reports/low-stock`
- `GET /ai/suggestions`
- `POST /ai/generate-suggestions`

## 4 workflows (n8n)

Các file JSON nằm ở `n8n/workflows/` (import bằng script).

1) **Webhook ingest sale order**: nhận order JSON → gọi backend tạo đơn → trừ tồn kho  
2) **Daily low-stock alert**: cron 08:00 → lấy danh sách sắp hết → gửi email  
3) **Weekly + Webhook send revenue PDF**: cron Mon 08:00 + webhook từ frontend → lấy PDF → email đính kèm  
4) **AI forecast & reorder**: cron 09:00 → lấy sales history + tồn kho → gọi backend tạo gợi ý AI → lưu DB → email

> Lưu ý: Sau khi import, bạn cần vào n8n UI → Credentials → tạo SMTP credential và gán cho các node "Send Email", rồi **Activate** workflows.
