# SVG to Image Converter

A web application that allows users to input SVG code, preview it, and export it as high-quality PNG or JPG images.

## Features

- **Dual Mode Converter**: Support for both SVG code and Mermaid diagrams
- **SVG Code Input**: Large textarea for entering SVG code
- **Mermaid Diagrams**: Support for flowcharts, sequence diagrams, and more
- **Theme Selection**: Choose between Light and Dark background themes
- **Real-time Preview**: Automatic rendering with live preview
- **Zoom & Fullscreen**: Interactive zoom controls and fullscreen preview mode
- **High-Quality Export**: Support for PNG (lossless) and JPG formats
- **Smart Scaling**: Automatic upscaling for better image quality
- **Responsive Design**: Works on desktop and mobile devices

## Usage

### SVG Conversion
1. Switch to the "SVG转换" tab
2. Enter your SVG code in the textarea (must start with `<svg>` and end with `</svg>`)
3. Choose your preferred background theme (Light or Dark)
4. The preview will update automatically with zoom and fullscreen controls
5. Select your preferred export format (PNG recommended for best quality)
6. Click "导出图片" to download the converted image

### Mermaid Diagrams
1. Switch to the "Mermaid图表" tab
2. Enter your Mermaid diagram code (flowcharts, sequence diagrams, etc.)
3. Choose your preferred background theme (Light or Dark)
4. The preview will update automatically with zoom and fullscreen controls
5. Select your preferred export format (PNG recommended for best quality)
6. Click "导出图片" to download the converted image

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