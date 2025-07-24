// SVG和Mermaid图表转换工具
document.addEventListener('DOMContentLoaded', function() {
  // 初始化Mermaid
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true,
      curve: 'basis'
    },
    themeVariables: {
      primaryColor: '#6366f1',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#4f46e5',
      lineColor: '#64748b'
    }
  });
  
  // 变量定义
  let currentZoom = 1;
  let svgCurrentZoom = 1;
  let isFullscreen = false;
  let fullscreenZoom = 1;
  let keyboardHandler = null;
  let wheelHandler = null;
  let dragHandlers = null;
  
  // 获取DOM元素
  const svgInput = document.getElementById('svgInput');
  const previewContainer = document.getElementById('previewContainer');
  const previewBtn = document.getElementById('previewBtn');
  const exportBtn = document.getElementById('exportBtn');
  
  const mermaidInput = document.getElementById('mermaidInput');
  const mermaidPreviewContainer = document.getElementById('mermaidPreviewContainer');
  const mermaidPreviewContent = document.getElementById('mermaidPreviewContent');
  const mermaidPreviewBtn = document.getElementById('mermaidPreviewBtn');
  const mermaidExportBtn = document.getElementById('mermaidExportBtn');
  
  // SVG缩放控制按钮
  const svgZoomInBtn = document.getElementById('svgZoomInBtn');
  const svgZoomOutBtn = document.getElementById('svgZoomOutBtn');
  const svgResetZoomBtn = document.getElementById('svgResetZoomBtn');
  const svgFullscreenBtn = document.getElementById('svgFullscreenBtn');
  
  // Mermaid缩放控制按钮
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const resetZoomBtn = document.getElementById('resetZoomBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  
  // 标签页切换
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('Tab clicked:', btn.dataset.tab);
      switchTab(btn.dataset.tab);
    });
  });
  
  // 事件监听器绑定
  if (previewBtn) previewBtn.addEventListener('click', previewSVG);
  if (mermaidPreviewBtn) mermaidPreviewBtn.addEventListener('click', previewMermaid);
  
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const format = document.getElementById('formatSelect').value;
      exportAsImage(format);
    });
  }
  
  if (mermaidExportBtn) {
    mermaidExportBtn.addEventListener('click', () => {
      const format = document.getElementById('mermaidFormatSelect').value;
      exportMermaidAsImage(format);
    });
  }
  
  // SVG缩放按钮
  if (svgZoomInBtn) svgZoomInBtn.addEventListener('click', () => { svgCurrentZoom = Math.min(svgCurrentZoom * 1.2, 5); applySvgZoom(); });
  if (svgZoomOutBtn) svgZoomOutBtn.addEventListener('click', () => { svgCurrentZoom = Math.max(svgCurrentZoom / 1.2, 0.2); applySvgZoom(); });
  if (svgResetZoomBtn) svgResetZoomBtn.addEventListener('click', () => { svgCurrentZoom = 1; applySvgZoom(); });
  if (svgFullscreenBtn) svgFullscreenBtn.addEventListener('click', toggleSvgFullscreen);
  
  // Mermaid缩放按钮
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => { currentZoom = Math.min(currentZoom * 1.2, 5); applyZoom(); });
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => { currentZoom = Math.max(currentZoom / 1.2, 0.2); applyZoom(); });
  if (resetZoomBtn) resetZoomBtn.addEventListener('click', () => { currentZoom = 1; applyZoom(); });
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
  
  // 自动预览
  setTimeout(() => {
    previewSVG();
    previewMermaid();
  }, 500);
  
  // 标签切换函数
  function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
  }
  
  // SVG预览函数
  function previewSVG() {
    if (!svgInput || !previewContainer) return;
    
    const svgCode = svgInput.value.trim();
    
    if (!svgCode) {
      previewContainer.innerHTML = '<p class="placeholder">SVG预览将在此显示</p>';
      previewContainer.classList.remove('has-content');
      if (exportBtn) exportBtn.disabled = true;
      return;
    }
    
    if (!svgCode.toLowerCase().startsWith('<svg') || !svgCode.toLowerCase().includes('</svg>')) {
      previewContainer.innerHTML = '<p class="placeholder">无效的SVG格式。请确保代码以&lt;svg&gt;开始，以&lt;/svg&gt;结束</p>';
      previewContainer.classList.remove('has-content');
      if (exportBtn) exportBtn.disabled = true;
      return;
    }
    
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = svgCode;
      const svgElement = tempDiv.querySelector('svg');
      
      if (!svgElement) {
        throw new Error('未找到有效的SVG元素');
      }
      
      previewContainer.innerHTML = '';
      previewContainer.appendChild(svgElement.cloneNode(true));
      previewContainer.classList.add('has-content');
      if (exportBtn) exportBtn.disabled = false;
      
      applySvgZoom();
      console.log('SVG预览成功');
    } catch (error) {
      previewContainer.innerHTML = `<p class="placeholder">渲染SVG时出错: ${error.message}</p>`;
      previewContainer.classList.remove('has-content');
      if (exportBtn) exportBtn.disabled = true;
      console.error('SVG预览错误:', error);
    }
  }
  
  // Mermaid预览函数
  function previewMermaid() {
    if (!mermaidInput || !mermaidPreviewContent) return;
    
    const mermaidCode = mermaidInput.value.trim();
    
    if (!mermaidCode) {
      mermaidPreviewContent.innerHTML = '<p class="placeholder">Mermaid图表预览将在此显示</p>';
      if (mermaidPreviewContainer) mermaidPreviewContainer.classList.remove('has-content');
      if (mermaidExportBtn) mermaidExportBtn.disabled = true;
      return;
    }
    
    try {
      mermaidPreviewContent.innerHTML = '';
      const uniqueId = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      mermaid.render(uniqueId, mermaidCode).then(({svg}) => {
        mermaidPreviewContent.innerHTML = svg;
        if (mermaidPreviewContainer) mermaidPreviewContainer.classList.add('has-content');
        if (mermaidExportBtn) mermaidExportBtn.disabled = false;
        applyZoom();
        console.log('Mermaid图表渲染成功');
      }).catch(error => {
        console.error('Mermaid渲染错误:', error);
        let errorMsg = '渲染失败';
        if (error.message) {
          if (error.message.includes('Parse error')) {
            errorMsg = '语法错误，请检查Mermaid代码格式';
          } else if (error.message.includes('suitable point')) {
            errorMsg = '图表布局错误，请尝试简化图表结构';
          } else {
            errorMsg = error.message;
          }
        }
        mermaidPreviewContent.innerHTML = `<p class="placeholder">Mermaid渲染失败: ${errorMsg}</p>`;
        if (mermaidPreviewContainer) mermaidPreviewContainer.classList.remove('has-content');
        if (mermaidExportBtn) mermaidExportBtn.disabled = true;
      });
    } catch (error) {
      console.error('预览错误:', error);
      mermaidPreviewContent.innerHTML = `<p class="placeholder">预览失败: ${error.message || '未知错误'}</p>`;
      if (mermaidPreviewContainer) mermaidPreviewContainer.classList.remove('has-content');
      if (mermaidExportBtn) mermaidExportBtn.disabled = true;
    }
  }
  
  // 缩放函数
  function applySvgZoom() {
    if (previewContainer) {
      previewContainer.style.transform = `scale(${svgCurrentZoom})`;
    }
  }
  
  function applyZoom() {
    if (mermaidPreviewContent) {
      mermaidPreviewContent.style.transform = `scale(${currentZoom})`;
    }
  }
  
  // 全屏功能
  function toggleSvgFullscreen() {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      const svgContent = previewContainer?.querySelector('svg');
      if (!svgContent) {
        alert('没有可全屏显示的SVG');
        return;
      }
      createFullscreenOverlay(svgContent, 'SVG');
    }
  }
  
  function toggleFullscreen() {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      const mermaidContent = mermaidPreviewContent?.querySelector('svg');
      if (!mermaidContent) {
        alert('没有可全屏显示的图表');
        return;
      }
      createFullscreenOverlay(mermaidContent, 'Mermaid');
    }
  }
  
  function createFullscreenOverlay(content, type) {
    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    overlay.id = 'fullscreenOverlay';
    
    const controls = document.createElement('div');
    controls.className = 'fullscreen-controls';
    controls.innerHTML = `
      <div class="control-group">
        <button id="fullscreenZoomIn" title="放大 (Ctrl/Cmd + +)">🔍+</button>
        <button id="fullscreenZoomOut" title="缩小 (Ctrl/Cmd + -)">🔍-</button>
        <button id="fullscreenResetZoom" title="重置缩放 (Ctrl/Cmd + 0)">↻</button>
        <button id="fullscreenFit" title="适应屏幕 (F)">⛶</button>
      </div>
      <button id="exitFullscreen" class="exit-btn" title="退出全屏 (ESC)">✕</button>
    `;
    
    const previewArea = document.createElement('div');
    previewArea.className = 'fullscreen-preview-area';
    previewArea.id = 'fullscreenPreviewArea';
    
    const contentContainer = document.createElement('div');
    contentContainer.className = 'fullscreen-content-container';
    contentContainer.id = 'fullscreenContentContainer';
    
    const clonedContent = content.cloneNode(true);
    clonedContent.style.maxWidth = 'none';
    clonedContent.style.maxHeight = 'none';
    clonedContent.style.width = 'auto';
    clonedContent.style.height = 'auto';
    
    contentContainer.appendChild(clonedContent);
    previewArea.appendChild(contentContainer);
    overlay.appendChild(controls);
    overlay.appendChild(previewArea);
    document.body.appendChild(overlay);
    
    // 绑定全屏控制事件
    document.getElementById('fullscreenZoomIn').addEventListener('click', fullscreenZoomIn);
    document.getElementById('fullscreenZoomOut').addEventListener('click', fullscreenZoomOut);
    document.getElementById('fullscreenResetZoom').addEventListener('click', fullscreenResetZoom);
    document.getElementById('fullscreenFit').addEventListener('click', fitToScreen);
    document.getElementById('exitFullscreen').addEventListener('click', exitFullscreen);
    
    // 键盘快捷键支持
    keyboardHandler = function(e) {
      if (!isFullscreen) return;
      
      if (e.code === 'Escape') {
        exitFullscreen();
      } else if (e.code === 'Equal' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        fullscreenZoomIn();
      } else if (e.code === 'Minus' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        fullscreenZoomOut();
      } else if (e.code === 'Digit0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        fullscreenResetZoom();
      } else if (e.code === 'KeyF') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
          e.preventDefault();
          fitToScreen();
        }
      }
    };
    document.addEventListener('keydown', keyboardHandler);
    
    // 鼠标滚轮缩放
    wheelHandler = function(e) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          fullscreenZoomIn();
        } else {
          fullscreenZoomOut();
        }
      }
    };
    previewArea.addEventListener('wheel', wheelHandler, { passive: false });
    
    // 改进的拖拽功能
    initDrag(previewArea, contentContainer);
    
    setTimeout(fitToScreen, 100);
    
    isFullscreen = true;
    document.body.style.overflow = 'hidden';
  }
  
  function initDrag(previewArea, contentContainer) {
    let isDragging = false;
    let startX, startY;
    let currentTranslateX = 0;
    let currentTranslateY = 0;
    let startTranslateX = 0;
    let startTranslateY = 0;
    
    function getCurrentTransform() {
      const transform = contentContainer.style.transform || '';
      const scaleMatch = transform.match(/scale\(([^)]+)\)/);
      const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
      
      const scale = scaleMatch ? parseFloat(scaleMatch[1]) : (fullscreenZoom || 1);
      const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
      const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;
      
      return { scale, translateX, translateY };
    }
    
    function applyTransform(translateX, translateY, scale) {
      scale = scale || fullscreenZoom || 1;
      contentContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
    
    const startDrag = function(e) {
      if (e.button !== 0) return;
      
      isDragging = true;
      previewArea.style.cursor = 'grabbing';
      previewArea.style.userSelect = 'none';
      
      startX = e.clientX;
      startY = e.clientY;
      
      const currentTransform = getCurrentTransform();
      startTranslateX = currentTranslateX = currentTransform.translateX;
      startTranslateY = currentTranslateY = currentTransform.translateY;
      
      e.preventDefault();
      e.stopPropagation();
    };
    
    const drag = function(e) {
      if (!isDragging) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      currentTranslateX = startTranslateX + deltaX;
      currentTranslateY = startTranslateY + deltaY;
      
      applyTransform(currentTranslateX, currentTranslateY);
    };
    
    const endDrag = function(e) {
      if (!isDragging) return;
      
      isDragging = false;
      previewArea.style.cursor = 'grab';
      previewArea.style.userSelect = '';
      
      e.preventDefault();
      e.stopPropagation();
    };
    
    contentContainer.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    contentContainer.addEventListener('selectstart', function(e) {
      if (isDragging) e.preventDefault();
    });
    
    contentContainer.addEventListener('contextmenu', function(e) {
      if (isDragging) e.preventDefault();
    });
    
    dragHandlers = {
      startDrag, drag, endDrag, contentContainer, applyTransform, getCurrentTransform
    };
  }
  
  function fullscreenZoomIn() {
    fullscreenZoom = Math.min((fullscreenZoom || 1) * 1.25, 10);
    applyFullscreenZoom();
  }
  
  function fullscreenZoomOut() {
    fullscreenZoom = Math.max((fullscreenZoom || 1) / 1.25, 0.1);
    applyFullscreenZoom();
  }
  
  function fullscreenResetZoom() {
    fullscreenZoom = 1;
    applyFullscreenZoom();
    centerContent();
  }
  
  function applyFullscreenZoom() {
    if (dragHandlers && dragHandlers.applyTransform && dragHandlers.getCurrentTransform) {
      const currentTransform = dragHandlers.getCurrentTransform();
      dragHandlers.applyTransform(currentTransform.translateX, currentTransform.translateY, fullscreenZoom);
    } else {
      const contentContainer = document.getElementById('fullscreenContentContainer');
      if (contentContainer) {
        const transform = contentContainer.style.transform || '';
        const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
        const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;
        
        contentContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${fullscreenZoom || 1})`;
      }
    }
    
    const zoomPercentage = Math.round((fullscreenZoom || 1) * 100);
    const resetBtn = document.getElementById('fullscreenResetZoom');
    if (resetBtn) {
      resetBtn.title = `重置缩放 (当前: ${zoomPercentage}%)`;
    }
  }
  
  function fitToScreen() {
    const contentContainer = document.getElementById('fullscreenContentContainer');
    const svgElement = contentContainer?.querySelector('svg');
    
    if (!contentContainer || !svgElement) return;
    
    const availableWidth = window.innerWidth - 40;
    const availableHeight = window.innerHeight - 100;
    
    const originalZoom = fullscreenZoom;
    fullscreenZoom = 1;
    contentContainer.style.transform = 'translate(0px, 0px) scale(1)';
    
    setTimeout(() => {
      const svgRect = svgElement.getBoundingClientRect();
      const svgWidth = svgRect.width;
      const svgHeight = svgRect.height;
      
      if (svgWidth === 0 || svgHeight === 0) {
        fullscreenZoom = originalZoom;
        applyFullscreenZoom();
        return;
      }
      
      const scaleX = availableWidth / svgWidth;
      const scaleY = availableHeight / svgHeight;
      const optimalScale = Math.min(scaleX, scaleY, 5);
      
      fullscreenZoom = Math.max(optimalScale, 0.1);
      applyFullscreenZoom();
      centerContent();
    }, 50);
  }
  
  function centerContent() {
    const contentContainer = document.getElementById('fullscreenContentContainer');
    if (contentContainer && dragHandlers && dragHandlers.applyTransform) {
      setTimeout(() => {
        dragHandlers.applyTransform(0, 0, fullscreenZoom);
      }, 50);
    }
  }
  
  function exitFullscreen() {
    if (keyboardHandler) {
      document.removeEventListener('keydown', keyboardHandler);
      keyboardHandler = null;
    }
    
    if (wheelHandler) {
      const previewArea = document.getElementById('fullscreenPreviewArea');
      if (previewArea) {
        previewArea.removeEventListener('wheel', wheelHandler);
      }
      wheelHandler = null;
    }
    
    if (dragHandlers) {
      document.removeEventListener('mousemove', dragHandlers.drag);
      document.removeEventListener('mouseup', dragHandlers.endDrag);
      dragHandlers = null;
    }
    
    const overlay = document.getElementById('fullscreenOverlay');
    if (overlay) {
      overlay.remove();
    }
    
    isFullscreen = false;
    fullscreenZoom = 1;
    document.body.style.overflow = '';
  }
  
  // 导出函数
  function exportAsImage(format = 'png') {
    try {
      const svgElement = previewContainer?.querySelector('svg');
      if (!svgElement) {
        alert('没有可导出的SVG。请先预览SVG。');
        return;
      }
      
      const svgRect = svgElement.getBoundingClientRect();
      let svgWidth = svgElement.width?.baseVal?.value || svgRect.width || 300;
      let svgHeight = svgElement.height?.baseVal?.value || svgRect.height || 300;
      
      const minSize = 800;
      if (svgWidth < minSize || svgHeight < minSize) {
        const ratio = Math.max(minSize / svgWidth, minSize / svgHeight);
        svgWidth *= ratio;
        svgHeight *= ratio;
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = 4;
      canvas.width = svgWidth * scale;
      canvas.height = svgHeight * scale;
      
      ctx.scale(scale, scale);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      if (format === 'jpg' || format === 'jpeg') {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, svgWidth, svgHeight);
      }
      
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
              a.download = `svg-export-${Date.now()}.${format}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              
              console.log(`${format.toUpperCase()} 文件下载成功！`);
            } else {
              console.error(`创建 ${format.toUpperCase()} blob失败。`);
            }
          }, mimeType, quality);
        } catch (canvasError) {
          console.error(`Canvas绘制失败: ${canvasError.message}`);
        }
      };
      
      img.onerror = () => {
        console.error('加载SVG为图像失败。请检查您的SVG代码。');
      };
      
      img.src = svgDataUrl;
      
    } catch (error) {
      console.error(`导出失败: ${error.message}`);
    }
  }
  
  function exportMermaidAsImage(format = 'png') {
    try {
      const svgElement = mermaidPreviewContainer?.querySelector('svg');
      if (!svgElement) {
        alert('没有可导出的图表。请先预览Mermaid图表。');
        return;
      }
      
      const svgRect = svgElement.getBoundingClientRect();
      let svgWidth = svgElement.width?.baseVal?.value || svgRect.width || 800;
      let svgHeight = svgElement.height?.baseVal?.value || svgRect.height || 600;
      
      const minSize = 800;
      if (svgWidth < minSize || svgHeight < minSize) {
        const ratio = Math.max(minSize / svgWidth, minSize / svgHeight);
        svgWidth *= ratio;
        svgHeight *= ratio;
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = 4;
      canvas.width = svgWidth * scale;
      canvas.height = svgHeight * scale;
      
      ctx.scale(scale, scale);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      if (format === 'jpg' || format === 'jpeg') {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, svgWidth, svgHeight);
      }
      
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
              
              console.log(`${format.toUpperCase()} 文件下载成功！`);
            } else {
              console.error(`创建 ${format.toUpperCase()} 文件失败。`);
            }
          }, mimeType, quality);
        } catch (canvasError) {
          console.error(`Canvas绘制失败: ${canvasError.message}`);
        }
      };
      
      img.onerror = () => {
        console.error('图表加载失败，请检查Mermaid代码。');
      };
      
      img.src = svgDataUrl;
      
    } catch (error) {
      console.error(`导出失败: ${error.message}`);
    }
  }
});