import { EventHandler } from "playcanvas-extended";

export class RefCount extends EventHandler {
    constructor(public refCount = 0) {
        super()
    }

    /**
     * Fired whenever a reference is added
     *
     * @event RefCount#inc
     * @param {number} refCount - The new ref count
     */

    /**
     * Fired whenever a reference is removed
     *
     * @event RefCount#dec
     * @param {number} refCount - The new ref count
     */

    /**
     * Fired whenever reference count is raised from zero to one
     *
     * @event RefCount#enable
     */

    /**
     * Fired whenever reference count is lowered from one to zero
     *
     * @event RefCount#disable
     */

    /**
     * Raises the reference count
     */
    inc() {
        this.refCount++
        this.fire('inc', this.refCount)
        if (this.refCount === 1)
            this.fire('enable')
    }

    /**
     * Lowers the reference count
     */
    dec() {
        this.refCount--
        this.fire('dec', this.refCount)
        if (this.refCount === 0)
            this.fire('disable')
    }
}