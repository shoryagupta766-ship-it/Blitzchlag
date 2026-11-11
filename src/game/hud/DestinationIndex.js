// src/game/hud/DestinationIndex.js
import { DESTINATIONS } from '../config.js';
import { state } from '../utils/state.js';
import { events } from '../utils/events.js';

export class DestinationIndex {
  constructor(parent) {
    this.el = document.createElement('div');
    this.el.className = 'hud-dest-index collapsed';

    this.header = document.createElement('button');
    this.header.className = 'index-header';
    this.header.setAttribute('aria-expanded', 'false');
    this.header.onclick = () => {
      const isCollapsed = this.el.classList.toggle('collapsed');
      this.header.setAttribute('aria-expanded', !isCollapsed);
    };
    
    this.list = document.createElement('ul');
    this.list.className = 'index-list';

    this.rows = DESTINATIONS.map(dest => {
      const li = document.createElement('li');
      li.className = 'index-row';
      li.onclick = () => events.emit('fastTravel', dest.t);
      
      const info = document.createElement('div');
      info.innerHTML = `<strong>0${dest.id} ${dest.name}</strong><br/><span>${dest.landmark}</span>`;
      
      const status = document.createElement('div');
      status.className = 'index-status';
      
      li.appendChild(info);
      li.appendChild(status);
      this.list.appendChild(li);
      
      return { li, status, dest };
    });

    this.el.appendChild(this.header);
    this.el.appendChild(this.list);
    parent.appendChild(this.el);

    events.on('destination:visited', (id) => {
      if (!state.visited.includes(id)) state.visited.push(id);
      this.update();
    });
  }

  update() {
    const validDests = DESTINATIONS.filter(d => d.hash !== null);
    const collected = validDests.filter(d => state.visited.includes(d.id)).length;
    this.header.innerHTML = `YOUR TICKET: ${collected} of ${validDests.length} STOPS <span class="arrow">▼</span>`;

    this.rows.forEach(row => {
      if (state.visited.includes(row.dest.id)) {
        row.status.textContent = 'DONE';
        row.li.className = 'index-row done';
      } else if (state.nearestDestination && state.nearestDestination.id === row.dest.id) {
        row.status.textContent = 'HERE';
        row.li.className = 'index-row here';
      } else {
        row.status.textContent = 'AHEAD';
        row.li.className = 'index-row';
      }
    });
  }
}