document.addEventListener('DOMContentLoaded', function() {
    const applyHoverEffects = (selector, isFilterButton = false) => {
        const tags = document.querySelectorAll(selector);

        tags.forEach(tagElement => {
            const getOriginalBgColor = () => tagElement.style.getPropertyValue('--tag-bg-color').trim() || (isFilterButton && tagElement.classList.contains('active-tag-filter') ? tagElement.style.getPropertyValue('--tag-bg-color') : (isFilterButton ? '#e9ecef' : '#e0e0e0'));
            const getOriginalTextColor = () => tagElement.style.getPropertyValue('--tag-text-color').trim() || (isFilterButton && tagElement.classList.contains('active-tag-filter') ? tagElement.style.getPropertyValue('--tag-text-color') : (isFilterButton ? '#495057' : '#555'));
            const getOriginalBorderColor = () => tagElement.style.getPropertyValue('--tag-border-color').trim() || (isFilterButton && tagElement.classList.contains('active-tag-filter') ? tagElement.style.getPropertyValue('--tag-border-color') : (isFilterButton ? '#ced4da' : '#e0e0e0'));


            let originalInlineBgColor = tagElement.style.backgroundColor;
            let originalInlineTextColor = tagElement.style.color;
            let originalInlineBorderColor = tagElement.style.borderColor;

            tagElement.addEventListener('mouseover', function() {
                originalInlineBgColor = this.style.backgroundColor;
                originalInlineTextColor = this.style.color;
                originalInlineBorderColor = this.style.borderColor;

                const hoverBgColor = getOriginalBgColor(); 
                const hoverTextColor = getOriginalTextColor(); 
                const hoverBorderColor = getOriginalBorderColor();

                this.style.backgroundColor = hoverBgColor;
                this.style.color = hoverTextColor;
                this.style.borderColor = hoverBorderColor; 
                this.style.opacity = '0.8'; 
            });

            tagElement.addEventListener('mouseout', function() {
                this.style.backgroundColor = originalInlineBgColor; 
                this.style.color = originalInlineTextColor;
                this.style.borderColor = originalInlineBorderColor; 
                this.style.opacity = '1'; 
            });
        });
    };

    applyHoverEffects('.tag-filter-button', true);
    applyHoverEffects('.task-tag-item');
});