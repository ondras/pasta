test:
	rm -rf coverage
	deno test --coverage
	deno coverage --detailed

demo:
	deno run demo.ts
