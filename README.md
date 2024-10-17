[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/bzPrOe11)

# CS3219 Project (PeerPrep) - AY2425S1

## Group: Gxx

### Note:

- You can choose to develop individual microservices within separate folders within this repository **OR** use individual repositories (all public) for each microservice.
- In the latter scenario, you should enable sub-modules on this GitHub classroom repository to manage the development/deployment **AND** add your mentor to the individual repositories as a collaborator.
- The teaching team should be given access to the repositories as we may require viewing the history of the repository in case of any disputes or disagreements.

# Note when adding new services

Initialising a new Nest.js project will cause a `.git` folder to exist within the service, which is not what we want. We want to remove the nested git folders by doing:

1. Verify that there is a nested `.git` directory

```bash
find backend/service_name/ -name ".git"
```

2. Remove the `.git` directory.

```bash
rm -rf backend/service_name/.git
```

# Backend: Service - Port Bindings

| Service          | Port |
| ---------------- | ---- |
| API Gateway      | 8000 |
| Question Service | 8001 |
