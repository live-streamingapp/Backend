// Numerology letter map
export const letterMap = {
	A: 1,
	I: 1,
	J: 1,
	Q: 1,
	Y: 1,
	a: 1,
	i: 1,
	j: 1,
	q: 1,
	y: 1,
	B: 2,
	K: 2,
	R: 2,
	b: 2,
	k: 2,
	r: 2,
	C: 3,
	G: 3,
	L: 3,
	S: 3,
	c: 3,
	g: 3,
	l: 3,
	s: 3,
	D: 4,
	M: 4,
	T: 4,
	d: 4,
	m: 4,
	t: 4,
	E: 5,
	H: 5,
	N: 5,
	X: 5,
	e: 5,
	h: 5,
	n: 5,
	x: 5,
	U: 6,
	V: 6,
	W: 6,
	u: 6,
	v: 6,
	w: 6,
	O: 7,
	Z: 7,
	o: 7,
	z: 7,
	F: 8,
	P: 8,
	f: 8,
	p: 8,
};

// Reduce a number to a single digit
export function reduceNumber(num, isName = false) {
	while (num > 9) {
		num = num
			.toString()
			.split("")
			.reduce((a, b) => a + parseInt(b), 0);
	}
	if (isName && num === 9) return 1;
	return num;
}

// Calculate numerology numbers
// Calculate numerology numbers
export function calculateNumbers(fullName, dob) {
	const name = fullName.replace(/[^A-Za-z]/g, "");
	let total = 0,
		vowels = 0,
		consonants = 0;

	for (let ch of name) {
		const val = letterMap[ch] || 0;
		total += val;
		if ("AEIOUaeiou".includes(ch)) vowels += val;
		else consonants += val;
	}

	const nameNumber = reduceNumber(total, true);
	const soulNumber = reduceNumber(vowels);
	const personalityNumber = reduceNumber(consonants);

	const [day, month, year] = dob.split("-").map((x) => parseInt(x));
	const lifePathNumber = reduceNumber(day);

	const dobDigits = dob.replace(/-/g, "").split("").map(Number);
	const destinyNumber = reduceNumber(dobDigits.reduce((a, b) => a + b, 0));

	// Correct Lo Shu Grid calculation
	let loShu = { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "" };

	// Count digits from DOB
	dobDigits.forEach((d) => {
		if (d !== 0) loShu[d] += d;
	});

	// Add Life Path Number (driver) once
	loShu[lifePathNumber] += lifePathNumber.toString();

	// Add Destiny Number (conductor) once
	loShu[destinyNumber] += destinyNumber.toString();

	// Add Name Number to its grid position
	loShu[nameNumber] += nameNumber.toString();

	return {
		nameNumber,
		soulNumber,
		personalityNumber,
		lifePathNumber,
		destinyNumber,
		loShuGrid: loShu,
	};
}
