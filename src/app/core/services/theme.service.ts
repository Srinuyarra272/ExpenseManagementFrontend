import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    darkMode = signal<boolean>(
        JSON.parse(localStorage.getItem('darkMode') || 'false')
    );

    constructor() {
        effect(() => {
            if (this.darkMode()) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('darkMode', 'false');
            }
        });
    }

    toggle() {
        this.darkMode.update(v => !v);
    }
}
