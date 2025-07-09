package crawler

import "sync"

type (
	// Channel on which we send int percentages 0-100.
	ProgressCh = chan int
)

var (
	mu        sync.RWMutex
	listeners = make(map[uint64][]ProgressCh) // urlID → fan-out list
)

// Subscribe returns a channel and a cancel func.
func Subscribe(urlID uint64) (ProgressCh, func()) {
	ch := make(ProgressCh, 4)

	mu.Lock()
	listeners[urlID] = append(listeners[urlID], ch)
	mu.Unlock()

	cancel := func() {
		mu.Lock()
		defer mu.Unlock()
		subs := listeners[urlID]
		for i, c := range subs {
			if c == ch {
				listeners[urlID] = append(subs[:i], subs[i+1:]...)
				close(c)
				break
			}
		}
	}
	return ch, cancel
}

// Publish fan-outs pct to every listener of urlID; non-blocking.
func Publish(urlID uint64, pct int) {
	mu.RLock()
	defer mu.RUnlock()
	for _, ch := range listeners[urlID] {
		select { // don’t block if client is slow
		case ch <- pct:
		default:
		}
	}
}
