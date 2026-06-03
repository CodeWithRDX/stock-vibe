#!/bin/bash

# ==============================================================================
# AWS EC2 Ubuntu 24.04 Setup Script for StockVibe Platform
# ==============================================================================

set -e # Exit immediately on error

echo "=== Updating packages and dependencies ==="
sudo apt-get update -y
sudo apt-get upgrade -y

echo "=== Installing essential tools ==="
sudo apt-get install -y curl git certbot python3-certbot-nginx ufw fail2ban

echo "=== Configuring UFW Firewall rules ==="
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
echo "y" | sudo ufw enable

echo "=== Installing Docker Engine ==="
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "=== Adjusting user groups ==="
# Allow running docker commands without sudo
sudo usermod -aG docker ubuntu

echo "=== Creating application deployment directories ==="
mkdir -p /home/ubuntu/app/logs
mkdir -p /home/ubuntu/app/backups
mkdir -p /home/ubuntu/app/nginx

# Ensure correct permissions
sudo chown -R ubuntu:ubuntu /home/ubuntu/app

echo "=== Setup complete! Please log out and log back in to activate docker permissions. ==="
