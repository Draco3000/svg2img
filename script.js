class SVGToJPGConverter {
    constructor() {
        this.svgInput = document.getElementById('svgInput');
        this.previewContainer = document.getElementById('previewContainer');
        this.previewBtn = document.getElementById('previewBtn');
        this.exportBtn = document.getElementById('exportBtn');
        
        // Mermaid elements
        this.mermaidInput = document.getElementById('mermaidInput');
        this.mermaidPreviewContainer = document.getElementById('mermaidPreviewContainer');
        this.mermaidPreviewBtn = document.getElementById('mermaidPreviewBtn');
        this.mermaidExportBtn = document.getElementById('mermaidExportBtn');
        
        // Zoom and fullscreen variables
        this.currentZoom = 1;
        this.isFullscreen = false;
        
        this.initEventListeners();
        this.initMermaid();
        this.previewSVG(); // Preview the default SVG
    }
    
    initEventListeners() {
        // SVG功能
        this.previewBtn.addEventListener('click', () => this.previewSVG());
        this.exportBtn.addEventListener('click', () => {
            const format = document.getElementById('formatSelect').value;
            this.exportAsImage(format);
        });
        
        // Mermaid功能
        this.mermaidPreviewBtn.addEventListener('click', () => this.previewMermaid());
        this.mermaidExportBtn.addEventListener('click', () => {
            const format = document.getElementById('mermaidFormatSelect').value;
            this.exportMermaidAsImage(format);
        });
        
        // 标签页切换
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // 缩放和全屏控制
        this.initZoomControls();
        
        // Auto-preview when user stops typing
        let svgTimeout, mermaidTimeout;
        this.svgInput.addEventListener('input', () => {
            clearTimeout(svgTimeout);
            svgTimeout = setTimeout(() => this.previewSVG(), 1000);
        });
        
        this.mermaidInput.addEventListener('input', () => {
            clearTimeout(mermaidTimeout);
            mermaidTimeout = setTimeout(() => this.previewMermaid(), 1000);
        });
    }
    
    initMermaid() {
        // 初始化Mermaid
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true
            }
        });
        
        // 预览默认的Mermaid图表
        setTimeout(() => this.previewMermaid(), 500);
    }
    
    initZoomControls() {
        // 缩放和全屏按钮事件
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const resetZoomBtn = document.getElementById('resetZoomBtn');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        
        if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoomIn());
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoomOut());
        if (resetZoomBtn) resetZoomBtn.addEventListener('click', () => this.resetZoom());
        if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // ESC键退出全屏
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.exitFullscreen();
            }
        });
    }
    
    zoomIn() {
        this.currentZoom = Math.min(this.currentZoom * 1.2, 5); // 最大5倍
        this.applyZoom();
    }
    
    zoomOut() {
        this.currentZoom = Math.max(this.currentZoom / 1.2, 0.2); // 最小0.2倍
        this.applyZoom();
    }
    
    resetZoom() {
        this.currentZoom = 1;
        this.applyZoom();
    }
    
    applyZoom() {
        const previewContent = document.getElementById('mermaidPreviewContent');
        if (previewContent) {
            previewContent.style.transform = `scale(${this.currentZoom})`;
        }
        
        // 如果在全屏模式，也应用到全屏预览
        const fullscreenPreview = document.querySelector('.fullscreen-preview');
        if (fullscreenPreview) {
            fullscreenPreview.style.transform = `scale(${this.currentZoom})`;
        }
    }
    
    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }
    
    enterFullscreen() {
        const mermaidContent = this.mermaidPreviewContainer.querySelector('.mermaid');
        if (!mermaidContent) {
            this.showMermaidError('没有可全屏显示的图表');
            return;
        }
        
        // 尝试使用浏览器原生全屏API
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().then(() => {
                this.createFullscreenOverlay(mermaidContent);
            }).catch(() => {
                // 如果原生全屏失败，使用自定义全屏
                this.createFullscreenOverlay(mermaidContent);
            });
        } else {
            // 浏览器不支持原生全屏，使用自定义全屏
            this.createFullscreenOverlay(mermaidContent);
        }
    }
    
    createFullscreenOverlay(mermaidContent) {
        // 创建全屏覆盖层
        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-overlay';
        overlay.id = 'fullscreenOverlay';
        
        // 创建全屏内容容器
        const fullscreenContent = document.createElement('div');
        fullscreenContent.className = 'fullscreen-content';
        
        // 创建全屏控制按钮
        const controls = document.createElement('div');
        controls.className = 'fullscreen-controls';
        controls.innerHTML = `
            <button id="fullscreenZoomIn" title="放大">🔍+</button>
            <button id="fullscreenZoomOut" title="缩小">🔍-</button>
            <button id="fullscreenResetZoom" title="重置缩放">↻</button>
            <button id="fullscreenFit" title="适应屏幕">⛶</button>
            <button id="exitFullscreen" title="退出全屏">✕</button>
        `;
        
        // 创建预览区域
        const previewArea = document.createElement('div');
        previewArea.className = 'fullscreen-preview auto-scale';
        previewArea.id = 'fullscreenPreviewArea';
        
        // 克隆Mermaid内容并优化显示
        const clonedContent = mermaidContent.cloneNode(true);
        
        // 移除原有的尺寸限制
        const svgElement = clonedContent.querySelector('svg');
        if (svgElement) {
            svgElement.style.maxWidth = 'none';
            svgElement.style.maxHeight = 'none';
            svgElement.style.width = 'auto';
            svgElement.style.height = 'auto';
        }
        
        previewArea.appendChild(clonedContent);
        
        // 组装全屏内容
        fullscreenContent.appendChild(controls);
        fullscreenContent.appendChild(previewArea);
        overlay.appendChild(fullscreenContent);
        
        // 添加到页面
        document.body.appendChild(overlay);
        
        // 自动适应屏幕大小
        setTimeout(() => this.fitToScreen(), 100);
        
        // 绑定全屏控制事件
        document.getElementById('fullscreenZoomIn').addEventListener('click', () => this.fullscreenZoomIn());
        document.getElementById('fullscreenZoomOut').addEventListener('click', () => this.fullscreenZoomOut());
        document.getElementById('fullscreenResetZoom').addEventListener('click', () => this.fullscreenResetZoom());
        document.getElementById('fullscreenFit').addEventListener('click', () => this.fitToScreen());
        document.getElementById('exitFullscreen').addEventListener('click', () => this.exitFullscreen());
        
        // 点击覆盖层退出全屏
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.exitFullscreen();
            }
        });
        
        // 监听窗口大小变化，自动重新适应
        this.resizeHandler = () => this.fitToScreen();
        window.addEventListener('resize', this.resizeHandler);
        
        this.isFullscreen = true;
        document.body.style.overflow = 'hidden';
    }
    
    fitToScreen() {
        const previewArea = document.getElementById('fullscreenPreviewArea');
        const svgElement = previewArea?.querySelector('svg');
        
        if (!previewArea || !svgElement) return;
        
        // 获取屏幕可用空间（减去控制按钮和边距）
        const availableWidth = window.innerWidth - 80; // 左右边距
        const availableHeight = window.innerHeight - 120; // 上下边距和控制按钮
        
        // 获取SVG原始尺寸
        const svgRect = svgElement.getBoundingClientRect();
        const svgWidth = svgRect.width;
        const svgHeight = svgRect.height;
        
        if (svgWidth === 0 || svgHeight === 0) return;
        
        // 计算缩放比例以适应屏幕
        const scaleX = availableWidth / svgWidth;
        const scaleY = availableHeight / svgHeight;
        const optimalScale = Math.min(scaleX, scaleY, 3); // 最大3倍缩放
        
        // 应用缩放
        this.fullscreenZoom = optimalScale;
        previewArea.style.transform = `scale(${optimalScale})`;
    }
    
    fullscreenZoomIn() {
        this.fullscreenZoom = Math.min((this.fullscreenZoom || 1) * 1.2, 5);
        this.applyFullscreenZoom();
    }
    
    fullscreenZoomOut() {
        this.fullscreenZoom = Math.max((this.fullscreenZoom || 1) / 1.2, 0.1);
        this.applyFullscreenZoom();
    }
    
    fullscreenResetZoom() {
        this.fullscreenZoom = 1;
        this.applyFullscreenZoom();
    }
    
    applyFullscreenZoom() {
        const previewArea = document.getElementById('fullscreenPreviewArea');
        if (previewArea) {
            previewArea.style.transform = `scale(${this.fullscreenZoom || 1})`;
        }
    }
    
    exitFullscreen() {
        // 移除窗口大小变化监听器
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        
        // 退出浏览器原生全屏
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {
                // 忽略退出全屏失败的错误
            });
        }
        
        // 移除自定义全屏覆盖层
        const overlay = document.getElementById('fullscreenOverlay');
        if (overlay) {
            overlay.remove();
        }
        
        this.isFullscreen = false;
        this.fullscreenZoom = 1;
        document.body.style.overflow = '';
        
        // 重置普通预览的缩放
        this.applyZoom();
    }
    
    switchTab(tabName) {
        // 切换标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // 切换内容区域
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
    
    previewSVG() {
        const svgCode = this.svgInput.value.trim();
        
        // Clear previous messages
        this.clearMessages();
        
        if (!svgCode) {
            this.showPlaceholder();
            this.exportBtn.disabled = true;
            return;
        }
        
        // Validate SVG format
        if (!this.isValidSVG(svgCode)) {
            this.showError('Invalid SVG format. Please ensure your code starts with <svg> and ends with </svg>');
            this.exportBtn.disabled = true;
            return;
        }
        
        try {
            // Create a temporary div to hold the SVG
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgCode;
            const svgElement = tempDiv.querySelector('svg');
            
            if (!svgElement) {
                throw new Error('No valid SVG element found');
            }
            
            // Clear preview container and add SVG
            this.previewContainer.innerHTML = '';
            this.previewContainer.appendChild(svgElement.cloneNode(true));
            this.previewContainer.classList.add('has-content');
            
            // Enable export button
            this.exportBtn.disabled = false;
            
            this.showSuccess('SVG preview loaded successfully!');
            
        } catch (error) {
            this.showError(`Error rendering SVG: ${error.message}`);
            this.exportBtn.disabled = true;
        }
    }
    
    isValidSVG(svgCode) {
        const trimmed = svgCode.trim();
        return trimmed.toLowerCase().startsWith('<svg') && 
               trimmed.toLowerCase().includes('</svg>');
    }
    
    async exportAsImage(format = 'png') {
        try {
            const svgElement = this.previewContainer.querySelector('svg');
            if (!svgElement) {
                this.showError('No SVG to export. Please preview an SVG first.');
                return;
            }
            
            // Get SVG dimensions
            const svgRect = svgElement.getBoundingClientRect();
            let svgWidth = svgElement.width?.baseVal?.value || svgRect.width || 300;
            let svgHeight = svgElement.height?.baseVal?.value || svgRect.height || 300;
            
            // Ensure minimum size for better quality
            const minSize = 800;
            if (svgWidth < minSize || svgHeight < minSize) {
                const ratio = Math.max(minSize / svgWidth, minSize / svgHeight);
                svgWidth *= ratio;
                svgHeight *= ratio;
            }
            
            // Create canvas with high resolution
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Use higher scale for better quality (4x for crisp images)
            const scale = 4;
            canvas.width = svgWidth * scale;
            canvas.height = svgHeight * scale;
            
            // Scale context for high DPI
            ctx.scale(scale, scale);
            
            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Set white background for JPG, transparent for PNG
            if (format === 'jpg' || format === 'jpeg') {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, svgWidth, svgHeight);
            }
            
            // Convert SVG to data URL directly (avoiding CORS issues)
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            
            // Create image and draw to canvas
            const img = new Image();
            img.onload = () => {
                try {
                    ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
                    
                    // Convert canvas to specified format and download
                    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
                    const quality = format === 'png' ? undefined : 0.95; // High quality for JPG
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `svg-export-${Date.now()}.${format}`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            
                            this.showSuccess(`${format.toUpperCase()} file downloaded successfully!`);
                        } else {
                            this.showError(`Failed to create ${format.toUpperCase()} blob.`);
                        }
                    }, mimeType, quality);
                } catch (canvasError) {
                    this.showError(`Canvas drawing failed: ${canvasError.message}`);
                }
            };
            
            img.onerror = () => {
                this.showError('Failed to load SVG as image. Please check your SVG code.');
            };
            
            img.src = svgDataUrl;
            
        } catch (error) {
            this.showError(`Export failed: ${error.message}`);
        }
    }
    
    previewMermaid() {
        const mermaidCode = this.mermaidInput.value.trim();
        
        // Clear previous messages
        this.clearMermaidMessages();
        
        if (!mermaidCode) {
            this.showMermaidPlaceholder();
            this.mermaidExportBtn.disabled = true;
            return;
        }
        
        try {
            // 重置缩放
            this.currentZoom = 1;
            
            // 获取预览内容容器
            const previewContent = document.getElementById('mermaidPreviewContent');
            if (!previewContent) {
                this.showMermaidError('预览容器未找到');
                return;
            }
            
            // 清空预览内容
            previewContent.innerHTML = '';
            
            // 创建一个临时div来渲染Mermaid
            const tempDiv = document.createElement('div');
            tempDiv.className = 'mermaid';
            tempDiv.textContent = mermaidCode;
            previewContent.appendChild(tempDiv);
            
            // 渲染Mermaid图表
            mermaid.init(undefined, tempDiv).then(() => {
                this.mermaidPreviewContainer.classList.add('has-content');
                this.mermaidExportBtn.disabled = false;
                this.applyZoom(); // 应用当前缩放
                this.showMermaidSuccess('Mermaid图表预览加载成功！');
            }).catch(error => {
                this.showMermaidError(`Mermaid渲染失败: ${error.message}`);
                this.mermaidExportBtn.disabled = true;
            });
            
        } catch (error) {
            this.showMermaidError(`预览失败: ${error.message}`);
            this.mermaidExportBtn.disabled = true;
        }
    }
    
    async exportMermaidAsImage(format = 'png') {
        try {
            const svgElement = this.mermaidPreviewContainer.querySelector('svg');
            if (!svgElement) {
                this.showMermaidError('没有可导出的图表。请先预览Mermaid图表。');
                return;
            }
            
            // 获取SVG尺寸
            const svgRect = svgElement.getBoundingClientRect();
            let svgWidth = svgElement.width?.baseVal?.value || svgRect.width || 800;
            let svgHeight = svgElement.height?.baseVal?.value || svgRect.height || 600;
            
            // 确保最小尺寸
            const minSize = 800;
            if (svgWidth < minSize || svgHeight < minSize) {
                const ratio = Math.max(minSize / svgWidth, minSize / svgHeight);
                svgWidth *= ratio;
                svgHeight *= ratio;
            }
            
            // 创建高分辨率canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const scale = 4;
            canvas.width = svgWidth * scale;
            canvas.height = svgHeight * scale;
            
            ctx.scale(scale, scale);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // 设置背景色
            if (format === 'jpg' || format === 'jpeg') {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, svgWidth, svgHeight);
            }
            
            // 转换SVG为图片
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            
            const img = new Image();
            img.onload = () => {
                try {
                    ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
                    
                    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
                    const quality = format === 'png' ? undefined : 0.95;
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `mermaid-chart-${Date.now()}.${format}`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            
                            this.showMermaidSuccess(`${format.toUpperCase()} 文件下载成功！`);
                        } else {
                            this.showMermaidError(`创建 ${format.toUpperCase()} 文件失败。`);
                        }
                    }, mimeType, quality);
                } catch (canvasError) {
                    this.showMermaidError(`Canvas绘制失败: ${canvasError.message}`);
                }
            };
            
            img.onerror = () => {
                this.showMermaidError('图表加载失败，请检查Mermaid代码。');
            };
            
            img.src = svgDataUrl;
            
        } catch (error) {
            this.showMermaidError(`导出失败: ${error.message}`);
        }
    }

    // Legacy method for backward compatibility
    async exportAsJPG() {
        return this.exportAsImage('jpg');
    }
    
    showPlaceholder() {
        this.previewContainer.innerHTML = '<p class="placeholder">SVG预览将在此显示</p>';
        this.previewContainer.classList.remove('has-content');
    }
    
    showMermaidPlaceholder() {
        const previewContent = document.getElementById('mermaidPreviewContent');
        if (previewContent) {
            previewContent.innerHTML = '<p class="placeholder">Mermaid图表预览将在此显示</p>';
        }
        this.mermaidPreviewContainer.classList.remove('has-content');
        this.currentZoom = 1;
    }
    
    showError(message) {
        this.clearMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.previewContainer.parentNode.appendChild(errorDiv);
    }
    
    showMermaidError(message) {
        this.clearMermaidMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.mermaidPreviewContainer.parentNode.appendChild(errorDiv);
    }
    
    showSuccess(message) {
        this.clearMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        this.previewContainer.parentNode.appendChild(successDiv);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
    
    showMermaidSuccess(message) {
        this.clearMermaidMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        this.mermaidPreviewContainer.parentNode.appendChild(successDiv);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
    
    clearMessages() {
        const messages = this.previewContainer.parentNode.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => msg.remove());
    }
    
    clearMermaidMessages() {
        const messages = this.mermaidPreviewContainer.parentNode.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => msg.remove());
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SVGToJPGConverter();
});