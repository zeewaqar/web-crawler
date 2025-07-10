package crawler

import "testing"

func TestDetectHTMLVersion(t *testing.T) {
	cases := []struct {
		in, want string
	}{
		{"<!DOCTYPE html>", "HTML 5"},
		{"<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\"", "HTML 4.01"},
		{"<?xml version='1.0'?><!DOCTYPE html PUBLIC ... xhtml", "XHTML"},
		{"<html>", "unknown"},
	}
	for _, c := range cases {
		if got := detectHTMLVersion(c.in); got != c.want {
			t.Fatalf("detect(%q) = %q; want %q", c.in, got, c.want)
		}
	}
}
