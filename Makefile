.PHONY: dev dev_screen dev_audio

dev_screen:
	make -C screen dev

dev_audio:
	make -C audio dev

dev: dev_screen dev_audio