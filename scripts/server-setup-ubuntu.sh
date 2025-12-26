#!/usr/bin/env bash
set -euo pipefail

# Minimal VPS bootstrap: Docker + Compose plugin + firewall ports 80/443
# Works on Ubuntu 20.04/22.04/24.04

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root: sudo bash scripts/server-setup-ubuntu.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release ufw

# Docker official repo
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable --now docker

# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose || true

echo "✅ Server setup done."
echo "Next: cp .env.example .env && edit .env, then run: bash scripts/deploy.sh"
