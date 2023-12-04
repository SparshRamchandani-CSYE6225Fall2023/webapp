packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = ">= 1.0.0"
    }
  }
}

variable "instace_type" {
  type    = string
  default = "t2.micro"
}

variable "ssh_username" {
  type    = string
  default = "admin"
}

variable ami_users {
  type    = list(string)
  default = ["773453770225", "884433268858"]
}

variable aws_profile {
  type    = string
  default = "aws-cli-ami"
}

source "amazon-ebs" "debian" {
  ami_name = "packer-debian12-ami-{{timestamp}}"
  source_ami_filter {
    owners      = ["amazon"]
    most_recent = true
    filters = {
      virtualization-type = "hvm"
      name                = "debian-12-amd64-*"
      root-device-type    = "ebs"
    }
  }
  instance_type = "${var.instace_type}"
  profile       = "${var.aws_profile}" # aws cli profile
  ssh_username  = "${var.ssh_username}"

  ami_users = "${var.ami_users}" # acc. id
}

build {
  sources = ["source.amazon-ebs.debian"]

  provisioner "shell" {
    inline = [
      "sudo chmod a+w /home",
      "sudo chmod -R +rwx /home",
      "sudo groupadd csye6225",
      "sudo useradd -s /bin/false -g csye6225 -d /opt/csye6225 -m csye6225",
    ]
  }

  provisioner "file" {
    source      = "setup.sh"
    destination = "/home/setup.sh"
  }

  provisioner "file" {
    source      = "./configs/cloudwatch-agent-config.json"
    destination = "/home/cloudwatch-agent-config.json"
  }

  provisioner "file" {
    direction   = "upload"
    source      = "./artifacts/webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "shell" {
    inline = [
      "sudo apt-get update",
      "sudo chmod +x /home/setup.sh",
      "sudo /home/setup.sh",
      "sudo apt-get install unzip",
      "sudo mkdir /opt/csye6225/web-app",
      "sudo unzip /tmp/webapp.zip -d /opt/csye6225/web-app",
      "sudo cp /opt/csye6225/web-app/systemd/webapp.service /etc/systemd/system/webapp.service",
      "cd /opt/csye6225/web-app",
      "sudo npm i",
      "sudo apt-get remove --purge -y git",
      "sudo rm -rf /home/admin/webapp.zip",
      "sudo chown -R csye6225:csye6225 /opt/csye6225",
      "sudo chmod -R 700 /opt/csye6225",
      #Installing CloudWatch Agent
      "echo 'Downloading the CloudWatch Agent package...'",
      "sudo wget https://s3.amazonaws.com/amazoncloudwatch-agent/debian/amd64/latest/amazon-cloudwatch-agent.deb",

      "echo 'Installing the CloudWatch Agent package...'",
      "sudo dpkg -i -E ./amazon-cloudwatch-agent.deb",

      "echo 'Enabling the CloudWatch Agent service...'",
      "sudo systemctl enable amazon-cloudwatch-agent",
      "sudo systemctl start amazon-cloudwatch-agent",
      "sudo rm ./amazon-cloudwatch-agent.deb",

      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp",
      "sudo systemctl start webapp",
      "sudo systemctl restart webapp",
      "sudo systemctl status webapp",
      "sudo systemctl enable amazon-cloudwatch-agent",
      "sudo systemctl start amazon-cloudwatch-agent",
    ]
  }

  post-processor "shell-local" {
    inline = [
      "echo 'Build Successful !!! Your debian AMI is ready'",
    ]
  }

  post-processor "manifest" {
    output = "manifest.json"
  }
}