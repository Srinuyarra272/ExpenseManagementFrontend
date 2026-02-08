import { trigger, transition, style, animate, query } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
    transition('* <=> *', [
        // Initial state of new route
        query(':enter', [
            style({ opacity: 0, transform: 'translateY(20px)' }),
        ], { optional: true }),

        // Animation
        query(':enter', [
            animate('400ms cubic-bezier(0.35, 0, 0.25, 1)',
                style({ opacity: 1, transform: 'translateY(0)' })
            )
        ], { optional: true })
    ])
]);
