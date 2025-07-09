package crawler

// Jobs is a global buffered channel; capacity = 100 URLs
var Jobs = make(chan uint64, 100)

// CloseQueue lets main() shut workers down gracefully
func CloseQueue() { close(Jobs) }
