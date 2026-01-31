'use client';

import { QRCodeSVG } from 'qrcode.react';

interface TelegramQRCodeProps {
  url: string;
  size?: number;
}

export function TelegramQRCode({ url, size = 120 }: TelegramQRCodeProps) {
  return (
    <div className="rounded-lg border bg-white p-2">
      <QRCodeSVG
        value={url}
        size={size}
        level="M"
        marginSize={0}
        bgColor="#ffffff"
        fgColor="#000000"
      />
    </div>
  );
}
