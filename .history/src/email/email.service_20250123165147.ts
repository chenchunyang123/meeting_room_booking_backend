import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: '274002525@qq.com',
        pass: 'dtcccrxlcxcqbiei',
      },
    });
  }

  async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const info = await this.transporter.sendMail({
      from: '274002525@qq.com',
      to,
      subject,
      html,
    });
    return info;
  }
}
