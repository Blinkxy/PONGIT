// build member list
window.buildMemberList = function(nickname)
{
  const invitedFriends = document.querySelector('.add-friend-container .option.add-member ul.drop-down');
  const list = document.createElement('li');
  
  list.classList.add('select-box');
  
  const profile = document.createElement('div');
  profile.classList.add('profile');

  const a = document.createElement('a');

  const img = document.createElement('img');
  img.src = "../assets/imgs/sidebar/ghost.jpeg";

  const span = document.createElement('span');
  span.classList.add('nickname');
  span.textContent = nickname;

  // append img and span to a
  a.appendChild(img);
  a.appendChild(span);
  
  // append a to profile
  profile.appendChild(a);

  const actions = document.createElement('div');
  actions.classList.add('actions');
  
  const a2 = document.createElement('a');

  const i = document.createElement('i');
  i.classList.add('fa-solid');
  i.classList.add('fa-plus');

  // append i to i
  a2.appendChild(i);

  // append a to actions div
  actions.appendChild(a2);

  list.appendChild(profile);
  list.appendChild(actions);

  // append li to ul
  invitedFriends.appendChild(list);
  // console.log(invitedFriends);
};

window.addListMember = function(nickname) {
  const invitedFriends = document.querySelector('.sidebar-right2 .friends .nav ul.drop-down');
  
  // create the owner of the member list only for the first time
  if(invitedFriends.children.length == 0)
  {
		console.log("yes");
		const li = document.createElement('li');
  
		li.classList.add('select-box');
		li.classList.add("owner")
		
		const profile = document.createElement('div');
		profile.classList.add('profile');

		const a = document.createElement('a');

		const img = document.createElement('img');
		img.src = "../assets/imgs/sidebar/ghost.jpeg";

		const span = document.createElement('span');
		span.classList.add('nickname');

		const i0 = document.createElement('i');
		i0.className = "fa-solid fa-user";
  }
 
  const list = document.createElement('li');
  
  list.classList.add('select-box');
  list.classList.add("ch-friends")
  
  const profile = document.createElement('div');
  profile.classList.add('profile');

  const a = document.createElement('a');

  const img = document.createElement('img');
  img.src = "../assets/imgs/sidebar/ghost.jpeg";

  const span = document.createElement('span');
  span.classList.add('nickname');

  const i0 = document.createElement('i');
  i0.className = "fa-solid fa-user";

  const span2 = document.createElement('span');
//   span2.classList.add('nickname');
  span2.textContent = nickname;

  span.appendChild(i0);
  span.appendChild(span2);

  // append img and span to a
  a.appendChild(img);
  a.appendChild(span);
  
  // append a to profile
  profile.appendChild(a);

  const actions = document.createElement('div');
  actions.classList.add('actions');
  
  const a2 = document.createElement('a');
  a2.className = "first";

  const i = document.createElement('i');
  i.className = "fa-solid fa-user-gear";

  // append i to i
  a2.appendChild(i);


  const a3 = document.createElement('a');
  a3.className = "second";

  const i2 = document.createElement('i');
  i2.className = "fa-solid fa-table-tennis-paddle-ball";

  // append i to i
  a3.appendChild(i2);

  // append a to actions div
  actions.appendChild(a2);
  actions.appendChild(a3);

  list.appendChild(profile);
  list.appendChild(actions);

  // append li to ul
  invitedFriends.appendChild(list);
}

/*
	<div class="member-setting">
		<a class="pass"><i class="fa-solid fa-hand-holding-hand"></i><span>Pass Channel Ownership</span></a>
		<a class="promote"><i class="fa-solid fa-user-shield"></i><span>Promote To Admin</span></a>
		<a class="ban"><i class="fa-solid fa-hammer"></i><span>Ban User</span></a>
		<a class="kick"><i class="fa-solid fa-person-falling"></i><span>Kick User</span></a>
		<a class="mute"><i class="fa-solid fa-comment-slash"></i><span>Mute User</span></a>
	</div>
 */
// window.createMemberSetting = function (parent) {
	
// 	// create member-setting div
// 	const memberSetting = document.createElement('div');
// 	memberSetting.classList.add('member-setting');

// 	parent.appendChild(memberSetting);

// 	//create a tag 
// 	const a1 = document.createElement('a');
// 	a1.classList.add('pass');

// 	memberSetting.appendChild(a1);

// 	// create i tag
// 	const i1 = document.createElement('i');
// 	i1.className = 'fa-solid fa-user-shield';

// 	// create span tag
// 	const span1 = document.createElement('span');
// 	span1.innerHTML = "Pass Channel Ownership";

// 	a1.appendChild(i1);
// 	a1.appendChild(span1);


// 	//create a tag 
// 	const a2 = document.createElement('a');
// 	a2.classList.add('promote');

// 	memberSetting.appendChild(a2);

// 	// create i tag
// 	const i2 = document.createElement('i');
// 	i2.className = 'fa-solid fa-user-shield';

// 	// create span tag
// 	const span2 = document.createElement('span');
// 	span2.innerHTML = "Promote To Admin";

// 	a2.appendChild(i2);
// 	a2.appendChild(span2);


// 	//create a tag 
// 	const a3 = document.createElement('a');
// 	a3.classList.add('ban');

// 	memberSetting.appendChild(a3);

// 	// create i tag
// 	const i3 = document.createElement('i');
// 	i3.className = 'fa-solid fa-hammer';

// 	// create span tag
// 	const span3 = document.createElement('span');
// 	span3.innerHTML = "Ban User";

// 	a3.appendChild(i3);
// 	a3.appendChild(span3);


// 	//create a tag 
// 	const a4 = document.createElement('a');
// 	a4.classList.add('kick');

// 	memberSetting.appendChild(a4);

// 	// create i tag
// 	const i4 = document.createElement('i');
// 	i4.className = 'fa-solid fa-person-falling';

// 	// create span tag
// 	const span4 = document.createElement('span');
// 	span4.innerHTML = "Kick User";

// 	a4.appendChild(i4);
// 	a4.appendChild(span4);
	

// 	//create a tag 
// 	const a5 = document.createElement('a');
// 	a5.classList.add('mute');

// 	memberSetting.appendChild(a5);

// 	// create i tag
// 	const i5 = document.createElement('i');
// 	i5.className = 'fa-solid fa-comment-slash';

// 	// create span tag
// 	const span5 = document.createElement('span');
// 	span5.innerHTML = "Mute User";

// 	a5.appendChild(i5);
// 	a5.appendChild(span5);

// }



// Function to create the member-setting window
window.createMemberSetting = function (parent) {
    // Remove existing member-setting if it exists (to avoid duplicates)
    const existingMemberSetting = parent.querySelector('.member-setting');
    if (existingMemberSetting) return;

    // Create the member-setting div
    const memberSetting = document.createElement('div');
    memberSetting.classList.add('member-setting');

    // Example content (customize as needed)
    memberSetting.innerHTML = `
        <a class="pass"><i class="fa-solid fa-hand-holding-hand"></i><span>Pass Channel Ownership</span></a>
        <a class="promote"><i class="fa-solid fa-user-shield"></i><span>Promote To Admin</span></a>
        <a class="ban"><i class="fa-solid fa-hammer"></i><span>Ban User</span></a>
        <a class="kick"><i class="fa-solid fa-person-falling"></i><span>Kick User</span></a>
        <a class="mute"><i class="fa-solid fa-comment-slash"></i><span>Mute User</span></a>
    `;

    parent.appendChild(memberSetting);
};

// function to create channel-setting window
window.createChannelSetting = function (parent) {

	// Remove existing member-setting if it exists (to avoid duplicates)
    const existingMemberSetting = parent.querySelector('.channel-setting');
    if (existingMemberSetting) return;

    // Create the member-setting div
    const memberSetting = document.createElement('div');
    memberSetting.classList.add('channel-setting');

    // Example content (customize as needed)
    memberSetting.innerHTML = `
		<a class="change"><i class="fa-solid fa-pen"></i><span>Change Channel Name</span></a>
		<a><i class="fa-solid fa-paintbrush"></i><span>Change Channel Type</span></a>
		<a class="unban"><i class="fa-solid fa-face-frown"></i><span>Unban List</span></a>
		<a class="delete"><i class="fa-solid fa-fire"></i><span>Delete Channel</span></a>
    `;
    parent.appendChild(memberSetting);


}


