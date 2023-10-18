packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = ">= 1.0.0"
    }
  }
}

source "amazon-ebs" "debian" {
  ami_name      = "packer-debian12-ami-{{timestamp}}"
  source_ami    = "ami-06db4d78cb1d3bbf9"
  instance_type = "t2.micro"
  region        = "us-east-1"
  profile       = "aws-cli-ami" # aws cli profile
  ssh_username  = "admin"

  ami_users = ["773453770225", "884433268858"] # acc. id
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
      "sudo chmod a+w /web-app",
      "sudo chmod -R +rwx /web-app",
    ]
  }


  post-processor "shell-local" {
    inline = [
      "cd web-app",
      "npm i",
      "echo 'Build Successful !!! Your debian AMI is ready'",
    ]
  }
}