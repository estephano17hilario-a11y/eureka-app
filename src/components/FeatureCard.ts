import type { FeatureItem } from '../types';

export function renderFeatureCard(item: FeatureItem): string {
  return `
    <div class="feature-card" data-feature-id="${item.id}">
      <div class="feature-card-header">
        <div class="feature-icon-wrap ${item.colorClass}">
          ${item.icon}
        </div>
        <span class="feature-tag">${item.tag}</span>
      </div>
      <h3 class="feature-title">${item.title}</h3>
      <p class="feature-desc">${item.description}</p>
    </div>
  `;
}
