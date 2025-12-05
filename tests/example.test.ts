describe('Example Test Suite', () => {
  test('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  test('should verify string operations', () => {
    const projectName = 'Disc Radio';
    expect(projectName).toContain('Radio');
    expect(projectName.length).toBeGreaterThan(0);
  });

  test('should handle arrays', () => {
    const items = ['TypeScript', 'Node.js', 'Express'];
    expect(items).toHaveLength(3);
    expect(items).toContain('TypeScript');
  });
});
