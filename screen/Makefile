.PHONY: default init venv build

PythonBin = python
ActivateScript = venv\Scripts\activate.bat
DeactivateScript = venv\Scripts\deactivate.bat

ifeq ($(OS),Linux)
	PythonBin = python3
	ActivateScript = venv\Scripts\activate
	DeactivateScript = venv\Scripts\deactivate
endif

default: build

venv:
	$(PythonBin) -m venv venv

latest_pip:
	$(ActivateScript) && \
		python -m pip install --upgrade pip && \
	$(DeactivateScript)
	
fetch_requirements:
	$(ActivateScript) && \
		pip install -r requirements.txt && \
	$(DeactivateScript)
	
	
init: venv latest_pip fetch_requirements
	
build: init
	$(ActivateScript) && \
	$(DeactivateScript)