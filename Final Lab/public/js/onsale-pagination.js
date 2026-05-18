$(document).ready(function () {
  const perPage = 10;
  const $cards = $('#product-list .product-card');

  if ($cards.length === 0) {
    return;
  }

  let currentPage = 1;
  const totalPages = Math.max(1, Math.ceil($cards.length / perPage));

  function updateControls() {
    $('#page-indicator').text('Page ' + currentPage + ' of ' + totalPages);

    if (currentPage <= 1) {
      $('#prev-btn').prop('disabled', true).hide();
    } else {
      $('#prev-btn').prop('disabled', false).show();
    }

    if (currentPage >= totalPages) {
      $('#next-btn').prop('disabled', true).hide();
    } else {
      $('#next-btn').prop('disabled', false).show();
    }
  }

  function showPage(page) {
    $cards.hide();
    const start = (page - 1) * perPage;
    const end = start + perPage;
    $cards.slice(start, end).show();
    updateControls();
  }

  $cards.hide();
  showPage(1);

  $('#next-btn').on('click', function () {
    if (currentPage >= totalPages) {
      return;
    }
    currentPage += 1;
    showPage(currentPage);
  });

  $('#prev-btn').on('click', function () {
    if (currentPage <= 1) {
      return;
    }
    currentPage -= 1;
    showPage(currentPage);
  });
});
