# SVG to Image Converter

A web application that allows users to input SVG code, preview it, and export it as high-quality PNG or JPG images.

## Features

- **SVG Code Input**: Large textarea for entering SVG code
- **Real-time Preview**: Automatic SVG rendering with live preview
- **High-Quality Export**: Support for PNG (lossless) and JPG formats
- **Smart Scaling**: Automatic upscaling for better image quality
- **Responsive Design**: Works on desktop and mobile devices

## Usage

1. Enter your SVG code in the textarea (must start with `<svg>` and end with `</svg>`)
2. The preview will update automatically
3. Select your preferred export format (PNG recommended for best quality)
4. Click "Export Image" to download the converted image

## Technical Features

- 4x resolution scaling for crisp output
- Minimum 800px size enforcement
- High-quality image smoothing
- CORS-safe SVG to image conversion
- White background for JPG, transparent for PNG

## Deployment

### Deploy to Vercel

1. Push this code to a GitHub repository
2. Connect your GitHub account to Vercel
3. Import the repository in Vercel
4. Deploy automatically

Or use Vercel CLI:
```bash
npm i -g vercel
vercel
```

### Local Development

```bash
python3 -m http.server 3000
```

Then open http://localhost:3000

## File Structure

```
├── index.html          # Main HTML file
├── style.css           # Styling and responsive design
├── script.js           # SVG conversion logic
├── vercel.json         # Vercel deployment configuration
├── package.json        # Project metadata
└── README.md           # This file
```

## Browser Compatibility

- Modern browsers with Canvas API support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers supported

## License

MIT License