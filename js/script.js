function fetchAnimalInfo() {
    const selectedCards = [];
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');

    if (checkboxes.length != 3) {
      alert('Please select exactly 3 cards.');
      return;
    }

    checkboxes.forEach(checkbox => {
      selectedCards.push(checkbox.value);
    });

    const requestBody = {
      prompt: `You are a fortune teller that responds with a Tarot reading interpretation of three cards provided by the user.
      Card 1 represents the past, Card 2 represents the present, Card 3 represents the future.\nUser: ${selectedCards.join(', ')}`,
      max_tokens: 100
    };

    fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
      },
      body: JSON.stringify(requestBody)
    })
      .then(response => response.json())
      .then(data => {
        const message = data.choices[0].text.trim();
        document.getElementById('output').innerHTML = message;
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }