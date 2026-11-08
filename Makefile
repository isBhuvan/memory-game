PORT ?= 8080
SRC  := src

.DEFAULT_GOAL := help
.PHONY: help serve test check clean

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "} {printf "  \033[36m%-8s\033[0m %s\n", $$1, $$2}'

serve: ## Run the game locally at http://localhost:$(PORT)
	@echo "Serving $(SRC)/ at http://localhost:$(PORT) (Ctrl+C to stop)"
	@python3 -m http.server $(PORT) --directory $(SRC)

test: ## Run the unit tests (requires Node 20+)
	@node --test "test/*.test.js"

check: ## Syntax-check every JS file, then run the tests
	@for f in $(SRC)/js/*.js; do node --check $$f || exit 1; done
	@$(MAKE) --no-print-directory test

clean: ## Remove local editor/OS junk
	@find . -name '.DS_Store' -delete
	@rm -rf node_modules
