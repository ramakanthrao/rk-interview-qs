/**
 * EventEmitter
 * A simple event emitter implementation with support for on, once, off, emit.
 * 
 * Features:
 * - Register event listeners with on()
 * - One-time listeners with once()
 * - Remove listeners with off()
 * - Emit events with emit()
 * - Wildcard event support ('*')
 * - Returns statistics via getStats()
 * 
 * Usage:
 *   const emitter = new EventEmitter();
 *   emitter.on('data', (payload) => console.log(payload));
 *   emitter.emit('data', { value: 42 });
 */

class EventEmitter {
    constructor(options = {}) {
        this._events = new Map();
        this._onceEvents = new Map();
        this._maxListeners = options.maxListeners || 10;
        this._stats = {
            totalEmits: 0,
            totalListenerCalls: 0,
            eventsRegistered: 0
        };
    }

    /**
     * Register an event listener
     */
    on(event, listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('Listener must be a function');
        }

        if (!this._events.has(event)) {
            this._events.set(event, []);
            this._stats.eventsRegistered++;
        }

        const listeners = this._events.get(event);
        
        if (listeners.length >= this._maxListeners) {
            console.warn(`MaxListenersExceeded: ${event} has ${listeners.length} listeners`);
        }

        listeners.push(listener);
        return this;
    }

    /**
     * Register a one-time event listener
     */
    once(event, listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('Listener must be a function');
        }

        if (!this._onceEvents.has(event)) {
            this._onceEvents.set(event, []);
        }

        this._onceEvents.get(event).push(listener);
        return this;
    }

    /**
     * Remove an event listener
     */
    off(event, listener) {
        // Remove from regular listeners
        if (this._events.has(event)) {
            const listeners = this._events.get(event);
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
                if (listeners.length === 0) {
                    this._events.delete(event);
                }
            }
        }

        // Remove from once listeners
        if (this._onceEvents.has(event)) {
            const listeners = this._onceEvents.get(event);
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
                if (listeners.length === 0) {
                    this._onceEvents.delete(event);
                }
            }
        }

        return this;
    }

    /**
     * Remove all listeners for an event (or all events if no event specified)
     */
    removeAllListeners(event) {
        if (event === undefined) {
            this._events.clear();
            this._onceEvents.clear();
        } else {
            this._events.delete(event);
            this._onceEvents.delete(event);
        }
        return this;
    }

    /**
     * Emit an event with optional payload
     */
    emit(event, ...args) {
        this._stats.totalEmits++;
        let called = false;

        // Call regular listeners
        if (this._events.has(event)) {
            for (const listener of this._events.get(event)) {
                listener.apply(this, args);
                this._stats.totalListenerCalls++;
                called = true;
            }
        }

        // Call and remove once listeners
        if (this._onceEvents.has(event)) {
            const onceListeners = this._onceEvents.get(event).slice();
            this._onceEvents.delete(event);
            for (const listener of onceListeners) {
                listener.apply(this, args);
                this._stats.totalListenerCalls++;
                called = true;
            }
        }

        // Call wildcard listeners
        if (event !== '*' && this._events.has('*')) {
            for (const listener of this._events.get('*')) {
                listener.apply(this, [event, ...args]);
                this._stats.totalListenerCalls++;
                called = true;
            }
        }

        return called;
    }

    /**
     * Get the number of listeners for an event
     */
    listenerCount(event) {
        let count = 0;
        if (this._events.has(event)) {
            count += this._events.get(event).length;
        }
        if (this._onceEvents.has(event)) {
            count += this._onceEvents.get(event).length;
        }
        return count;
    }

    /**
     * Get all event names that have listeners
     */
    eventNames() {
        const names = new Set([
            ...this._events.keys(),
            ...this._onceEvents.keys()
        ]);
        return Array.from(names);
    }

    /**
     * Get statistics about the emitter
     */
    getStats() {
        return {
            ...this._stats,
            activeEvents: this.eventNames().length,
            totalListeners: this.eventNames().reduce((sum, e) => sum + this.listenerCount(e), 0)
        };
    }
}

module.exports = EventEmitter;
