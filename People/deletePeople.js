function deletePeople(people_id)
{
	$.ajax({
		url: '/people/' + people_id,
		type: 'DELETE',
		success: function(result) {
			window.location.reload(true);
			}
		})
};
