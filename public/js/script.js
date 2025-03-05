// Hover functionality for ingredients with optimized positioning
document.addEventListener('DOMContentLoaded', function() {
    const tooltip = document.getElementById('ingredient-tooltip');
    const OFFSET_X = 12; // Horizontal distance from cursor
    const OFFSET_Y = 8;  // Vertical distance from cursor
    
    document.querySelectorAll('.ingredient-item').forEach(ing => {
      ing.addEventListener('mousemove', (e) => {
        // Prepare tooltip content
        tooltip.innerHTML = `
          <h4>${ing.textContent.trim()}</h4>
          ${ing.dataset.origin ? `<p><strong>Origin:</strong> ${ing.dataset.origin}</p>` : ''}
          ${ing.dataset.safety ? `<p><strong>Safety:</strong> ${ing.dataset.safety}</p>` : ''}
          ${ing.dataset.fact ? `<p><strong>Fun Fact:</strong> ${ing.dataset.fact}</p>` : ''}
        `;
        
        tooltip.style.display = 'block';
        
        // Get dimensions and viewport information
        const tooltipRect = tooltip.getBoundingClientRect();
        const tooltipWidth = tooltipRect.width;
        const tooltipHeight = tooltipRect.height;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let leftPos = e.clientX + OFFSET_X;
        let topPos = e.clientY + OFFSET_Y;

        if (leftPos + tooltipWidth > viewportWidth - 10) {
          leftPos = e.clientX - tooltipWidth - OFFSET_X;
        }

        if (topPos + tooltipHeight > viewportHeight - 10) {
          topPos = e.clientY - tooltipHeight - OFFSET_Y;
        }
        
        leftPos = Math.max(10, leftPos);
        topPos = Math.max(10, topPos);
        
        // Apply the calculated position
        tooltip.style.left = `${leftPos}px`;
        tooltip.style.top = `${topPos}px`;
      });
    
      ing.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
    });
  });