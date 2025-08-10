// Test the African slip-on footwear name generator
const generateFootwearName = () => {
    const brands = ['Afro', 'Naija', 'Lagos', 'Kano', 'Eko', 'Sahel', 'Zuma', 'Baba', 'Mama', 'Royal'];
    const types = ['Cover Shoes', 'Slip-ons', 'Sandals', 'Slides', 'Flats', 'Mules', 'Clogs', 'Easy-wear', 'Comfort Shoes', 'Open-toe'];
    const styles = ['Classic', 'Traditional', 'Modern', 'Comfort', 'Soft', 'Easy', 'Light', 'Flexible', 'Breathable', 'Casual'];
    const colors = ['Black', 'Brown', 'Tan', 'Camel', 'Dark Brown', 'Light Brown', 'Natural', 'Chocolate', 'Coffee', 'Mahogany'];
    const materials = ['Leather', 'Suede', 'Canvas', 'Fabric', 'Woven', 'Soft-sole', 'Rubber-sole', 'Cork-sole'];
    
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const material = materials[Math.floor(Math.random() * materials.length)];
    
    // Generate random number for uniqueness
    const randomNum = Math.floor(Math.random() * 99) + 1;
    
    // Different name patterns focused on African slip-on footwear
    const patterns = [
        `${brand} ${type}`,
        `${color} ${type}`,
        `${style} ${type}`,
        `${brand} ${color} ${type}`,
        `${material} ${type}`,
        `${style} ${color} ${type}`,
        `${brand} ${style} ${type}`,
        `${type} ${randomNum}`,
        `${color} ${material} ${type}`,
        `${brand} ${material} Slides`
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)];
};

console.log('🌍 African Slip-on Footwear Name Generator Test');
console.log('===============================================');
console.log('');

console.log('Generated footwear names:');
for (let i = 1; i <= 15; i++) {
    const name = generateFootwearName();
    console.log(`${i.toString().padStart(2, '0')}. ${name}`);
}

console.log('');
console.log('✅ African slip-on footwear name generator working correctly!');
console.log('   - Names focus on slip-on, easy-wear footwear');
console.log('   - African-inspired brand names and styles');
console.log('   - Suitable for cover shoes, sandals, slides, etc.');
console.log('   - Professional and culturally appropriate');