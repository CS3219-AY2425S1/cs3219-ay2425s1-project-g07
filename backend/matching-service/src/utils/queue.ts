import { Mutex } from 'async-mutex';

export class Queue<T> {
    private items: T[] = [];
    private mutex: Mutex = new Mutex();

    async clean(predicate: (item: T) => boolean): Promise<T[]> {
        // higher priority
        const release = await this.mutex.acquire(1);
        try {
            var filtered = this.items.filter(obj => predicate(obj));
            this.items = this.items.filter(obj => !predicate(obj));
            return filtered;
        } finally {
            release();
        } 
    }

    async enqueue(element: T): Promise<void> {
        const release = await this.mutex.acquire();
        try {
            this.items.push(element);
        } finally {
            release();
        }   
    }

    async dequeue(): Promise<T | undefined> {
        const release = await this.mutex.acquire();
        try {
            if (this.isEmpty()) {
                return undefined;
            }
            return this.items.shift();  // Remove from the front
        } finally {
            release();
        }
    }

    // retrieve in order
    async retrieve(predicate: (item: T) => boolean): Promise<T | undefined> {
        const release = await this.mutex.acquire();
        try {
            for (let i = 0; i < this.size(); i++) {
                if (predicate(this.items[i])) {
                    return this.items.splice(i, 1)[0];
                }
            }
            return undefined;
        } finally {
            release();
        }
    }

    // no need to expose
    private isEmpty(): boolean {
        return this.items.length === 0;
    }

    size(): number {
        return this.items.length;
    }

    async print() {
        const release = await this.mutex.acquire();
        try {
            console.log(this.items);
        } finally {
            release();
        }
    }
}
