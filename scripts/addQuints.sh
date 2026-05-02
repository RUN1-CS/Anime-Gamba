id=1
echo "Do you wish to wipe user data for user $id before adding quints? (y/n)"
read -r answer
if [[ "$answer" == "y" ]]; then
    docker exec -it animegamba-server-1 node -e "require('/usr/src/app/src/data/utils.js').wipeUserData(1)"
    echo "User data wiped for user $id. Adding quints..."
fi
docker exec -it animegamba-server-1 node -e "require('/usr/src/app/src/data/utils.js').addSpecificWaifuToUser($id,'Miku Nakano')"
echo "Added Miku Nakano as a quint for user $id"
docker exec -it animegamba-server-1 node -e "require('/usr/src/app/src/data/utils.js').addSpecificWaifuToUser($id,'Itsuki Nakano')"
echo "Added Itsuki Nakano as a quint for user $id"
docker exec -it animegamba-server-1 node -e "require('/usr/src/app/src/data/utils.js').addSpecificWaifuToUser($id,'Nino Nakano')"
echo "Added Nino Nakano as a quint for user $id"
docker exec -it animegamba-server-1 node -e "require('/usr/src/app/src/data/utils.js').addSpecificWaifuToUser($id,'Yotsuba Nakano')"
echo "Added Yotsuba Nakano as a quint for user $id"
docker exec -it animegamba-server-1 node -e "require('/usr/src/app/src/data/utils.js').addSpecificWaifuToUser($id,'Ichika Nakano')"
echo "Added Ichika Nakano as a quint for user $id"