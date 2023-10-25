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
    ]
  }

  provisioner "file" {
    source      = "setup.sh"
    destination = "/home/setup.sh"
  }

  provisioner "file" {
    source      = "./systemd/webapp.service"
    destination = "/lib/systemd/system/webapp.service"
  }

  provisioner "file" {
    direction   = "upload"
    source      = "./artifacts/webapp.zip"
    destination = "webapp.zip"
  }

  provisioner "shell" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y expect",
      "sudo apt-get install -y unzip",
      "sudo chmod +x /home/setup.sh",
      "sudo /home/setup.sh",
      "sudo ls",
      "sudo apt-get install unzip",
      "mkdir web-app",
      "sudo unzip webapp.zip -d web-app",
      "cd web-app",
      "sudo npm i",
      "sudo apt-get remove --purge -y git",
    ]
  }


  post-processor "shell-local" {
    inline = [
      "echo 'Build Successful !!! Your debian AMI is ready'",
    ]
  }
}