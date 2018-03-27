function updatePlay(iid, pid){
	$.ajax({
		url: '/play/' + iid + - + pid,
		type: 'PUT',
		data: $('#update-play').serialize(),
		success:  function(result){
			window.location.replace("./");
		}
	})
}; 

