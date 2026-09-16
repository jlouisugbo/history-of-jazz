package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"time"
)

const (
	host = "127.0.0.1"
	port = "8765"
)

func main() {
	root, err := appRoot()
	if err != nil {
		log.Fatal(err)
	}

	url := fmt.Sprintf("http://%s:%s/quiz/", host, port)
	fmt.Printf("Quiz: %s\n", url)
	fmt.Println("Press Ctrl+C to stop.")

	go func() {
		time.Sleep(400 * time.Millisecond)
		openBrowser(url)
	}()

	addr := host + ":" + port
	if err := http.ListenAndServe(addr, http.FileServer(http.Dir(root))); err != nil {
		log.Fatal(err)
	}
}

func appRoot() (string, error) {
	candidates := make([]string, 0, 2)
	if cwd, err := os.Getwd(); err == nil {
		candidates = append(candidates, cwd)
	}
	if exe, err := os.Executable(); err == nil {
		dir, err := filepath.EvalSymlinks(filepath.Dir(exe))
		if err != nil {
			dir = filepath.Dir(exe)
		}
		candidates = append(candidates, dir)
	}
	for _, dir := range candidates {
		if hasQuiz(dir) {
			return dir, nil
		}
	}
	return "", fmt.Errorf("could not find quiz/ — run from the folder that contains quiz/ and exam1/")
}

func hasQuiz(dir string) bool {
	info, err := os.Stat(filepath.Join(dir, "quiz", "index.html"))
	return err == nil && !info.IsDir()
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", url)
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	if err := cmd.Start(); err != nil {
		fmt.Printf("Open in your browser: %s\n", url)
	}
}
