# utils.py
import pyotp
import qrcode
from django.conf import settings
import os
from datetime import datetime

class TwoFactorAuth:
    @staticmethod
    def generate_totp_secret():
        return pyotp.random_base32()

    @staticmethod
    def generate_qr_code(username, totp_secret, app_name="pongit v1"):
        totp = pyotp.TOTP(totp_secret)
        provisioning_uri = totp.provisioning_uri(username, issuer_name=app_name)

        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        qr_image = qr.make_image()

        qr_dir = os.path.join(settings.MEDIA_ROOT, 'qr_codes')
        os.makedirs(qr_dir, exist_ok=True)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'qr_{username}_{timestamp}.png'
        file_path = os.path.join(qr_dir, filename)
        qr_image.save(file_path)

        return os.path.join('qr_codes', filename)

    @staticmethod
    def verify_totp_code(totp_secret, totp_code):
        totp = pyotp.TOTP(totp_secret)
        
        return totp.verify(totp_code)
