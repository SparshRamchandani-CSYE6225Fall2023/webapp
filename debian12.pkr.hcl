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
    source      = "/home/runner/work/webapp-updated/webapp-updated"
    destination = "/home/my-app.zip"
  }

  provisioner "shell" {
    inline = [
      "sudo chmod +x /home/setup.sh",
      "sudo /home/setup.sh",
      "postgres"
      "expect -c 'setup.sh; expect \"Enter Password:\"; send \"your_password\n\"; interact'"
      "expect -c 'setup.sh; expect \"Please answer "y" or "n"\: \" ; send \"y\n\"; interact'"
      "sudo apt-get install -y unzip",
      "sudo unzip /home/my-app.zip",
      "sudo ls /home",
      "sudo ls /home/my-app",
    ]
  }

  post-processor "shell-local" {
    inline = [
      "echo 'Build Successful !!! Your debian AMI is ready'"
    ]
  }
}