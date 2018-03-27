function deletePlay(iid, pid)
{
	$.ajax({
		url: '/play/' + iid + - + pid,
		type: 'DELETE',
		success: function(result){
			window.location.reload(true);
		}
	})

};
